# TODO: Add Table Reservation Feature to UserFoodPage

## Completed Tasks
- [x] Updated UserFoodPage.js to include reservation form when no reservations exist
- [x] Added state variables for reservation form (showReserveForm, selectedSlot, selectedCapacity, availableTables, selectedTable, reserving)
- [x] Implemented handleReserveTable function to make API call for admin-reserved tables
- [x] Added useEffect to fetch available tables based on selected slot and capacity
- [x] Added reservation form UI with slot, capacity, and table selection
- [x] Added CSS styles for the new reservation form components
- [x] Integrated reservation form into the order summary panel

## Pending Tasks
- [ ] Test the reservation functionality in the browser
- [ ] Verify API endpoints are working correctly
- [ ] Check for any console errors or warnings
- [ ] Ensure responsive design works on mobile devices
- [ ] Test edge cases (e.g., no available tables, invalid selections)

## Notes
- The reservation form appears only when the user has no existing reservations
- Form includes slot selection (5-7PM, 7-9PM, 9-11PM), capacity (2, 4, 6 people), and table selection
- Uses admin-reserve endpoint to create reservations for users
- Updates user data after successful reservation to refresh reservations list
- Form can be toggled with a button to show/hide
