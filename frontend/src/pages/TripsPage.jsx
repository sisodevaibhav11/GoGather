import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { fetchNotifications, fetchTrips, requestConnection, deleteTrip } from '../api.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import NotificationCard from '../components/NotificationCard.jsx';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner.jsx';
import TripCard from '../components/TripCard.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyNotificationId, setBusyNotificationId] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const [tripsResponse, notificationsResponse] = await Promise.all([
          fetchTrips(),
          fetchNotifications(),
        ]);

        if (!isMounted) {
          return;
        }

        setTrips(tripsResponse.data.trips || []);
        setNotifications(notificationsResponse.data.notifications || []);
      } catch {
        if (isMounted) {
          toast.error('Could not load your trips right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const prevIdsRef = { current: new Set() };
    const pollInterval = 7000;
    const intervalId = setInterval(async () => {
      try {
        const notificationsResponse = await fetchNotifications();
        const newNotifications = notificationsResponse.data.notifications || [];

        const newIds = new Set(newNotifications.map((n) => n.connectionId));
        for (const id of prevIdsRef.current) {
          if (!newIds.has(id)) {
            toast.success('Connection status updated');
            break;
          }
        }

        if (isMounted) {
          setNotifications(newNotifications);
        }
        prevIdsRef.current = newIds;
      } catch {
        // ignore
      }
    }, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [tripsResponse, notificationsResponse] = await Promise.all([
        fetchTrips(),
        fetchNotifications(),
      ]);
      setTrips(tripsResponse.data.trips || []);
      setNotifications(notificationsResponse.data.notifications || []);
    } catch {
      toast.error('Could not load your trips right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(tripId) {
    try {
      await deleteTrip(tripId);
      setTrips((current) => current.filter((t) => t.id !== tripId));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete trip.');
    }
  }

  async function handleConnectBack(notification) {
    try {
      setBusyNotificationId(notification.connectionId);
      const { data } = await requestConnection({
        ownTripId: notification.ownTripId,
        targetTripId: notification.targetTripId,
      });
      toast.success(data.message);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not connect back.');
    } finally {
      setBusyNotificationId('');
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {!user?.profileCompleted ? <ProfileCompletionBanner /> : null}

      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">My matches</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your trip board</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Open any trip to see automatic matches, share the link, and unlock contact details through mutual connect.
        </p>
      </div>

      {notifications.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Pending connection requests</h2>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.connectionId}
              notification={notification}
              busy={busyNotificationId === notification.connectionId}
              onConnectBack={handleConnectBack}
            />
          ))}
        </section>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Create your first trip and share the link so more people can find you."
          action={(
            <Link to="/create-trip" className="btn-primary">
              Create trip
            </Link>
          )}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />)}
        </div>
      )}
    </section>
  );
}
