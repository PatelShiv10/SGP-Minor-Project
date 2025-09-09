/**
 * Migration Script: Fix Client-Document Relationships
 * 
 * This script addresses the "client relationship does not exist" issue by:
 * 1. Finding documents that don't have corresponding LawyerClient relationships
 * 2. Creating the missing relationships automatically
 * 3. Providing a report of what was fixed
 * 
 * Run this after deploying the updated controllers
 */

const mongoose = require('mongoose');
const Document = require('./models/Document');
const User = require('./models/User');
const LawyerClient = require('./models/LawyerClient');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Migration function
const fixClientDocumentRelationships = async () => {
  try {
    console.log('🔍 Starting client-document relationship migration...');
    
    const results = {
      totalDocuments: 0,
      documentsWithoutRelationships: 0,
      relationshipsCreated: 0,
      errors: [],
      report: []
    };

    // Get all documents with their client and lawyer info
    const documents = await Document.find({})
      .populate('clientId', 'firstName lastName email')
      .populate('lawyerId', 'firstName lastName email')
      .lean();

    results.totalDocuments = documents.length;
    console.log(`📊 Found ${documents.length} documents to check`);

    // Group documents by lawyer-client pairs
    const lawyerClientPairs = new Map();

    for (const doc of documents) {
      if (!doc.clientId || !doc.lawyerId) {
        results.errors.push({
          documentId: doc._id,
          error: 'Document missing clientId or lawyerId',
          title: doc.title
        });
        continue;
      }

      const pairKey = `${doc.lawyerId}_${doc.clientId._id}`;
      
      if (!lawyerClientPairs.has(pairKey)) {
        lawyerClientPairs.set(pairKey, {
          lawyerId: doc.lawyerId,
          clientId: doc.clientId._id,
          clientInfo: doc.clientId,
          documents: []
        });
      }
      
      lawyerClientPairs.get(pairKey).documents.push({
        id: doc._id,
        title: doc.title,
        createdAt: doc.createdAt
      });
    }

    console.log(`👥 Found ${lawyerClientPairs.size} unique lawyer-client pairs`);

    // Check each pair for existing relationship
    for (const [pairKey, pairData] of lawyerClientPairs) {
      const { lawyerId, clientId, clientInfo, documents } = pairData;

      // Check if LawyerClient relationship exists
      const existingRelationship = await LawyerClient.findOne({
        lawyerId: lawyerId,
        clientId: clientId
      });

      if (!existingRelationship) {
        results.documentsWithoutRelationships += documents.length;
        
        try {
          // Get the earliest document date for this pair
          const earliestDoc = documents.reduce((earliest, current) => {
            return new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest;
          });

          // Create the missing relationship
          const newRelationship = await LawyerClient.create({
            lawyerId: lawyerId,
            clientId: clientId,
            addedBy: 'migration',
            status: 'active',
            caseType: 'other',
            caseTitle: `Auto-migrated case for ${clientInfo.firstName} ${clientInfo.lastName}`,
            notes: `Relationship auto-created during migration on ${new Date().toLocaleDateString()} due to existing ${documents.length} document(s). Original document: "${earliestDoc.title}"`,
            lastContactDate: new Date(),
            caseStartDate: new Date(earliestDoc.createdAt)
          });

          results.relationshipsCreated++;
          results.report.push({
            action: 'CREATED',
            lawyerId: lawyerId,
            clientId: clientId,
            clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
            clientEmail: clientInfo.email,
            relationshipId: newRelationship._id,
            documentCount: documents.length,
            documents: documents.map(d => d.title)
          });

          console.log(`✅ Created relationship for ${clientInfo.firstName} ${clientInfo.lastName} (${documents.length} documents)`);

        } catch (createError) {
          if (createError.code === 11000) {
            // Duplicate key error - relationship was created by another process
            console.log(`⚠️  Relationship already exists for ${clientInfo.firstName} ${clientInfo.lastName}`);
            results.report.push({
              action: 'ALREADY_EXISTS',
              lawyerId: lawyerId,
              clientId: clientId,
              clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
              clientEmail: clientInfo.email,
              documentCount: documents.length
            });
          } else {
            results.errors.push({
              pairKey: pairKey,
              error: createError.message,
              clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
              documentCount: documents.length
            });
            console.error(`❌ Failed to create relationship for ${clientInfo.firstName} ${clientInfo.lastName}:`, createError.message);
          }
        }
      } else {
        results.report.push({
          action: 'EXISTS',
          lawyerId: lawyerId,
          clientId: clientId,
          clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
          clientEmail: clientInfo.email,
          relationshipId: existingRelationship._id,
          documentCount: documents.length
        });
      }
    }

    // Print summary report
    console.log('\n📋 MIGRATION SUMMARY');
    console.log('====================');
    console.log(`Total documents checked: ${results.totalDocuments}`);
    console.log(`Documents without relationships: ${results.documentsWithoutRelationships}`);
    console.log(`New relationships created: ${results.relationshipsCreated}`);
    console.log(`Errors encountered: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.error} - Document: ${error.title || error.clientName}`);
      });
    }

    // Detailed report
    console.log('\n📊 DETAILED REPORT:');
    const actionCounts = results.report.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {});

    console.log(`Relationships that already existed: ${actionCounts.EXISTS || 0}`);
    console.log(`New relationships created: ${actionCounts.CREATED || 0}`);
    console.log(`Relationships that already existed (duplicate key): ${actionCounts.ALREADY_EXISTS || 0}`);

    if (results.relationshipsCreated > 0) {
      console.log('\n✅ CREATED RELATIONSHIPS:');
      results.report
        .filter(item => item.action === 'CREATED')
        .forEach((item, index) => {
          console.log(`${index + 1}. ${item.clientName} (${item.clientEmail}) - ${item.documentCount} documents`);
        });
    }

    return results;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Verification function
const verifyMigration = async () => {
  try {
    console.log('\n🔍 Verifying migration results...');
    
    // Check for orphaned documents (documents without relationships)
    const orphanedDocuments = await Document.aggregate([
      {
        $lookup: {
          from: 'lawyerclients',
          let: { lawyerId: '$lawyerId', clientId: '$clientId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$lawyerId', '$$lawyerId'] },
                    { $eq: ['$clientId', '$$clientId'] }
                  ]
                }
              }
            }
          ],
          as: 'relationship'
        }
      },
      {
        $match: {
          relationship: { $size: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          lawyerId: 1,
          clientId: 1
        }
      }
    ]);

    console.log(`🔍 Found ${orphanedDocuments.length} orphaned documents after migration`);
    
    if (orphanedDocuments.length > 0) {
      console.log('⚠️  REMAINING ORPHANED DOCUMENTS:');
      orphanedDocuments.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.title} (ID: ${doc._id})`);
      });
    } else {
      console.log('✅ No orphaned documents found! Migration successful.');
    }

    return orphanedDocuments;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
};

// Main execution
const runMigration = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting Client-Document Relationship Migration');
    console.log('================================================\n');
    
    const results = await fixClientDocumentRelationships();
    await verifyMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Save migration report to file
    const fs = require('fs');
    const reportPath = `./migration-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`📄 Migration report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  fixClientDocumentRelationships,
  verifyMigration,
  runMigration
};