import app from './app';
import db from './Database/connection/DbConnectionPool';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
