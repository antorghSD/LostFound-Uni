import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-uiu-orange">404</h1>
      <p className="mt-4 text-muted-foreground">Page not found</p>
      <Link to="/" className="mt-6 rounded-md bg-uiu-orange px-4 py-2 text-sm text-white hover:bg-uiu-orange-dark">
        Go home
      </Link>
    </div>
  );
}