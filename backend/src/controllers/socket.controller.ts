import { Server, Socket } from 'socket.io';
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';

export const handleSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Join user to their own room
    socket.on('join', (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      }
    });

    // Handle attorney's response to case request
    socket.on('caseRequestResponse', async (data) => {
      const { appointmentId, accepted, attorneyId } = data;
      const appointment = await Appointment.findById(appointmentId);

      if (accepted) {
        // Update appointment status to confirmed
        appointment.status = 'confirmed';
        await appointment.save();

        // Notify user to proceed with payment
        io.to(appointment.user.toString()).emit('proceedToPayment', { appointmentId, attorneyId });
      } else {
        // Update appointment status to cancelled
        appointment.status = 'cancelled';
        await appointment.save();

        // Get recommended attorneys
        const recommendedAttorneys = await User.find({
          role: 'attorney',
          status: 'active',
          _id: { $ne: attorneyId },
          specialization: { $in: [appointment.case_type] }
        }).limit(5);

        // Notify user with recommended attorneys
        io.to(appointment.user.toString()).emit('appointmentDeclined', { appointmentId, recommendedAttorneys });
      }
    });

    // Handle payment completion
    socket.on('paymentCompleted', async (data: {
      appointmentId: string,
      paymentDetails: {
        method: string,
        transaction_id: string,
        amount: number
      }
    }) => {
      try {
        const { appointmentId, paymentDetails } = data;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Update appointment with payment details
        appointment.payment = {
          method: paymentDetails.method,
          status: 'completed',
          transaction_id: paymentDetails.transaction_id,
          amount: paymentDetails.amount
        };
        await appointment.save();

        // Notify both parties
        io.to(appointment.user.toString()).emit('paymentConfirmed', { appointmentId });
        io.to(appointment.attorney.toString()).emit('paymentConfirmed', { appointmentId });
      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}; 