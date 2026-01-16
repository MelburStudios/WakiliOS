export function mergeDateAndTime(dateISO:any, time12h:any) {
    // Step 1: Convert ISO date to yyyy-mm-dd format
    const datePart = new Date(dateISO).toISOString().split("T")[0];
  
    // Step 2: Convert "1.00PM" to 24-hour format like "13:00"
    const [time, modifier] = time12h.toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.split('.');
    hours = parseInt(hours, 10);
    minutes = minutes || '00';
  
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
  
    const timePart = `${String(hours).padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
  
    // Step 3: Combine date and time
    const combined = `${datePart}T${timePart}`;
  
    // Step 4: Return ISO string or Date object
    return new Date(combined).toISOString(); // or just `new Date(combined)` if you prefer a Date object
  }