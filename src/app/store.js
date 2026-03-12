import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/usersSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import applicationsReducer from '../features/applications/applicationsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    tasks: tasksReducer,
    applications: applicationsReducer,
    messages: messagesReducer,
    reviews: reviewsReducer,
  },
});

