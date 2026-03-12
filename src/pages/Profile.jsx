import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Briefcase,
  Calendar,
  Edit,
  MessageSquare
} from 'lucide-react';
import { fetchUserById } from '../features/users/usersSlice';
import { fetchReviewsByUser } from '../features/reviews/reviewsSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { reviews } = useSelector((state) => state.reviews);
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchReviewsByUser(id));
    }
  }, [dispatch, id]);

  const isOwnProfile = loggedInUser?.id === currentUser?.id;

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-gray-300'}
      />
    ));
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  const userReviews = reviews.filter(r => r.revieweeId === id);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 bg-fuchsia-100 rounded-full flex items-center justify-center">
            <span className="text-fuchsia-600 text-4xl font-bold">
              {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <Badge variant={currentUser.role === 'client' ? 'primary' : currentUser.role === 'worker' ? 'secondary' : 'default'}>
                {currentUser.role}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                {currentUser.email}
              </div>
              {currentUser.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  {currentUser.phone}
                </div>
              )}
              {currentUser.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {currentUser.location}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center">
                <Star size={16} className="text-accent mr-2" />
                <span className="font-medium">
                  {currentUser.rating || 'N/A'}
                </span>
                <span className="text-gray-500 ml-1">({userReviews.length} reviews)</span>
              </div>
              {currentUser.role === 'worker' && (
                <div className="flex items-center">
                  <Briefcase size={16} className="text-primary mr-2" />
                  <span className="font-medium">{currentUser.completedTasks || 0}</span>
                  <span className="text-gray-500 ml-1">tasks completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button>
                <MessageSquare size={18} className="mr-2" />
                Message
              </Button>
            </div>
          )}
          {isOwnProfile && (
            <Button variant="outline">
              <Edit size={18} className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'about'
              ? 'text-fuchsia-600 border-b-2 border-fuchsia-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'reviews'
              ? 'text-fuchsia-600 border-b-2 border-fuchsia-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews ({userReviews.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Personal Information">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <User size={18} className="mr-3" />
                <span>{currentUser.firstName} {currentUser.lastName}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail size={18} className="mr-3" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={18} className="mr-3" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
              {currentUser.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-3" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              {currentUser.createdAt && (
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-3" />
                  <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>

          {currentUser.role === 'worker' && (
            <Card title="Skills">
              {currentUser.skills && currentUser.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill, idx) => (
                    <Badge key={idx} variant="primary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {userReviews.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Star size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews yet</h3>
                <p className="text-gray-600">This user hasn't received any reviews yet.</p>
              </div>
            </Card>
          ) : (
            userReviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">R</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">Reviewer #{review.reviewerId}</p>
                        <div className="flex items-center mt-1">
                          {getRatingStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;

