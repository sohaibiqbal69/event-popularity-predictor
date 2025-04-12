const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes); 