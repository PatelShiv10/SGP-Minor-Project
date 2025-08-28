const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
require('dotenv').config();

// Sample appointment data
const appointmentTypes = ['consultation', 'follow_up', 'document_review', 'legal_advice', 'court_preparation'];
const statuses = ['pending', 'confirmed', 'completed'];
const meetingTypes = ['video_call', 'phone_call', 'in_person'];

const sampleClients = [
  { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1-555-0101' },
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '+1-555-0102' },
  { firstName: 'Mike', lastName: 'Wilson', email: 'mike.wilson@email.com', phone: '+1-555-0103' },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', phone: '+1-555-0104' },
  { firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', phone: '+1-555-0105' },
  { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@email.com', phone: '+1-555-0106' },
  { firstName: 'James', lastName: 'Martinez', email: 'james.martinez@email.com', phone: '+1-555-0107' },
  { firstName: 'Maria', lastName: 'Rodriguez', email: 'maria.rodriguez@email.com', phone: '+1-555-0108' },
  { firstName: 'Robert', lastName: 'Lee', email: 'robert.lee@email.com', phone: '+1-555-0109' },
  { firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.taylor@email.com', phone: '+1-555-0110' }
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getRandomTimeSlot = () => {
  const hours = Math.floor(Math.random() * 9) + 9; // 9 AM to 5 PM
  const minutes = Math.random() < 0.5 ? 0 : 30;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const generateAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, create some test clients
    console.log('Creating test clients...');
    const createdClients = [];
    
    for (const clientData of sampleClients) {
      // Check if client already exists
      let client = await User.findOne({ email: clientData.email });
      
      if (!client) {
        client = await User.create({
          ...clientData,
          role: 'user',
          password: 'hashedpassword123', // In real app, this would be properly hashed
          agree: true,
          isVerified: true
        });
      }
      
      createdClients.push(client);
    }

    console.log(`✅ Created/found ${createdClients.length} test clients`);

    // Get all lawyers
    const lawyers = await User.find({ role: 'lawyer', status: 'approved' });
    console.log(`Found ${lawyers.length} lawyers`);

    if (lawyers.length === 0) {
      console.log('❌ No approved lawyers found. Please create some lawyers first.');
      return;
    }

    // Clear existing appointments
    await Booking.deleteMany({});
    console.log('🗑️ Cleared existing appointments');

    // Generate appointments for each lawyer
    const appointments = [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    for (const lawyer of lawyers) {
      const numAppointments = Math.floor(Math.random() * 20) + 10; // 10-30 appointments per lawyer
      
      for (let i = 0; i < numAppointments; i++) {
        const client = getRandomElement(createdClients);
        const appointmentDate = getRandomDate(oneWeekAgo, twoWeeksFromNow);
        const startTime = getRandomTimeSlot();
        const duration = getRandomElement([30, 45, 60, 90]);
        
        // Calculate end time
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = startTotalMinutes + duration;
        const endHours = Math.floor(endTotalMinutes / 60);
        const endMinutesRemainder = endTotalMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutesRemainder.toString().padStart(2, '0')}`;

        // Determine status based on date
        let status;
        if (appointmentDate < now) {
          status = Math.random() < 0.8 ? 'completed' : 'cancelled';
        } else {
          status = getRandomElement(['pending', 'confirmed', 'confirmed']); // More likely to be confirmed
        }

        const appointment = {
          lawyerId: lawyer._id,
          userId: client._id,
          date: formatDate(appointmentDate),
          start: startTime,
          end: endTime,
          durationMins: duration,
          appointmentType: getRandomElement(appointmentTypes),
          status: status,
          meetingType: getRandomElement(meetingTypes),
          notes: Math.random() < 0.3 ? 'Initial consultation regarding legal matter' : undefined,
          clientNotes: Math.random() < 0.4 ? 'Looking forward to discussing my case' : undefined,
          lawyerNotes: status === 'completed' && Math.random() < 0.5 ? 'Consultation completed successfully. Follow-up scheduled.' : undefined,
          confirmedAt: status === 'confirmed' || status === 'completed' ? new Date() : undefined,
          completedAt: status === 'completed' ? appointmentDate : undefined
        };

        try {
          const createdAppointment = await Booking.create(appointment);
          appointments.push(createdAppointment);
        } catch (error) {
          // Skip if there's a conflict (same lawyer, date, time)
          if (error.code !== 11000) {
            console.error('Error creating appointment:', error.message);
          }
        }
      }
    }

    console.log(`✅ Created ${appointments.length} test appointments`);

    // Generate some appointments for today
    const today = formatDate(now);
    const todayAppointments = [];

    for (const lawyer of lawyers.slice(0, 2)) { // Just first 2 lawyers for today
      for (let i = 0; i < 3; i++) {
        const client = getRandomElement(createdClients);
        const startTime = getRandomTimeSlot();
        const duration = getRandomElement([30, 45, 60]);
        
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = startTotalMinutes + duration;
        const endHours = Math.floor(endTotalMinutes / 60);
        const endMinutesRemainder = endTotalMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutesRemainder.toString().padStart(2, '0')}`;

        const appointment = {
          lawyerId: lawyer._id,
          userId: client._id,
          date: today,
          start: startTime,
          end: endTime,
          durationMins: duration,
          appointmentType: getRandomElement(appointmentTypes),
          status: getRandomElement(['pending', 'confirmed']),
          meetingType: getRandomElement(meetingTypes),
          clientNotes: 'Today\'s appointment - looking forward to our meeting'
        };

        try {
          const createdAppointment = await Booking.create(appointment);
          todayAppointments.push(createdAppointment);
        } catch (error) {
          if (error.code !== 11000) {
            console.error('Error creating today\'s appointment:', error.message);
          }
        }
      }
    }

    console.log(`✅ Created ${todayAppointments.length} appointments for today`);

    // Display summary
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Appointment Status Summary:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    console.log('\n🎉 Test data generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  generateAppointments().catch(console.error);
}

module.exports = { generateAppointments };