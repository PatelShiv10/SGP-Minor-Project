import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Clock, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

interface PublicLawyer {
  _id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface SlotsByDate { date: string; slots: string[] }

const fmtDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const AppointmentBooking = () => {
  const { lawyerId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLawyer, setLoadingLawyer] = useState(true);
  const [lawyer, setLawyer] = useState<PublicLawyer | null>(null);
  const [month, setMonth] = useState<Date>(new Date());
  const [slots, setSlots] = useState<SlotsByDate[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLawyer = async () => {
      try {
        setLoadingLawyer(true);
        const res = await fetch(`http://localhost:5000/api/lawyers/${lawyerId}/public`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setLawyer(data.data);
      } catch (e) {
        setLawyer(null);
      } finally {
        setLoadingLawyer(false);
      }
    };
    if (lawyerId) loadLawyer();
  }, [lawyerId]);

  const loadSlots = useMemo(() => async () => {
    try {
      setLoadingSlots(true);
      setError(null);
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const qs = `start=${fmtDate(start)}&end=${fmtDate(end)}`;
      const res = await fetch(`http://localhost:5000/api/bookings/lawyers/${lawyerId}/slots?${qs}`);
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();
      setSlots(data.data);
    } catch (e) {
      setSlots([]);
      setError('Failed to load availability');
    } finally {
      setLoadingSlots(false);
    }
  }, [lawyerId, month]);

  useEffect(() => {
    if (lawyerId) {
      loadSlots();
    }
  }, [loadSlots, lawyerId]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [] as string[];
    const entry = slots.find(s => s.date === fmtDate(selectedDate));
    return entry ? entry.slots.map(s => `${s}`) : [];
  }, [selectedDate, slots]);

  const disabled = useMemo(() => {
    const activeDates = new Set(slots.filter(s => s.slots.length > 0).map(s => s.date));
    return (date: Date) => !activeDates.has(fmtDate(date));
  }, [slots]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !caseDescription.trim() || !lawyerId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lawyerId,
          date: fmtDate(selectedDate),
          start: selectedTime.split(' ')[0],
          durationMins: 30
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Booking failed');
      }
      setIsBooked(true);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto shadow-soft border-0">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-navy mb-4">Appointment Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your consultation with {lawyer ? `${lawyer.firstName} ${lawyer.lastName}` : 'the lawyer'} has been successfully booked.
            </p>
            <div className="bg-green-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-green-800 mb-3">Appointment Details:</h3>
              <div className="space-y-2 text-green-700">
                <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> 1 hour</p>
                <p><strong>Rate:</strong> $250/hour</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button asChild className="bg-teal hover:bg-teal-light text-white">
                <Link to={`/video-call/${lawyerId}-${Date.now()}`}>
                  Join Video Call (Available at appointment time)
                </Link>
              </Button>
              <div>
                <Button asChild variant="outline">
                  <Link to="/find-lawyer">Back to Lawyers</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingLawyer) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lawyer not found</p>
          <Button asChild>
            <Link to="/find-lawyer">Back to list</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/lawyer/${lawyerId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Book Consultation</CardTitle>
                <p className="text-gray-600">Schedule your legal consultation with {lawyer.firstName} {lawyer.lastName}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                    month={month}
                    onMonthChange={setMonth}
                    disabled={disabled}
                    className="rounded-md border"
                  />
                  {loadingSlots && (
                    <div className="text-sm text-gray-500 mt-2">Loading availability...</div>
                  )}
                  {error && (
                    <div className="text-sm text-red-600 mt-2">{error}</div>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-3">Available Time Slots</h3>
                    {availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                            className={selectedTime === time 
                              ? 'bg-teal hover:bg-teal-light text-white' 
                              : 'border-teal text-teal hover:bg-teal hover:text-white'
                            }
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No available time slots for this date.</p>
                        <p className="text-sm">Please select a different date.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Case Description */}
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-3">Describe Your Legal Matter</h3>
                  <Textarea
                    value={caseDescription}
                    onChange={(e) => setCaseDescription(e.target.value)}
                    placeholder="Please provide a brief description of your legal matter. This will help the lawyer prepare for your consultation."
                    className="min-h-[120px] border-gray-300 focus:border-teal focus:ring-teal"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft border-0 sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg text-navy">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lawyer Info */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center font-semibold">
                    {lawyer.firstName?.[0]}{lawyer.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{lawyer.firstName} {lawyer.lastName}</p>
                    <p className="text-sm text-teal">{lawyer.specialization || 'General Practice'}</p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">1 hour</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-3">
                    <span>Total:</span>
                    <span className="text-navy">$250</span>
                  </div>
                </div>

                {/* Payment & Booking */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || !caseDescription.trim() || isLoading}
                    className="w-full bg-teal hover:bg-teal-light text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isLoading ? 'Processing...' : 'Book & Pay'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Payment will be processed securely via Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
