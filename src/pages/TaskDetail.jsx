import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Send
} from 'lucide-react';
import { fetchTaskById } from '../features/tasks/tasksSlice';
import { fetchApplicationsByTask, createApplication, updateApplicationStatus } from '../features/applications/applicationsSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { categories, urgencyLevels } from '../services/mockData';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask, isLoading: taskLoading } = useSelector((state) => state.tasks);
  const { applications, isLoading: appsLoading } = useSelector((state) => state.applications);
  const { user } = useSelector((state) => state.auth);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchTaskById(id));
    dispatch(fetchApplicationsByTask(id));
  }, [dispatch, id]);

  const handleApply = (data) => {
    dispatch(createApplication({
      taskId: id,
      workerId: user.id,
      ...data
    }));
    setShowApplyModal(false);
    reset();
  };

  const handleAcceptApplication = (applicationId) => {
    dispatch(updateApplicationStatus({ applicationId, status: 'accepted' }));
    // Also assign worker to task
  };

  const handleRejectApplication = (applicationId) => {
    dispatch(updateApplicationStatus({ applicationId, status: 'rejected' }));
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'assigned': return 'secondary';
      case 'published': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (taskLoading || !currentTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isClient = user?.role === 'client' && currentTask?.clientId === user?.id;
  const isWorker = user?.role === 'worker';
  const hasApplied = applications.some(app => app.workerId === user?.id);
  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={getStatusBadgeVariant(currentTask.status)}>
              {currentTask.status.replace('_', ' ')}
            </Badge>
            <Badge variant={currentTask.urgency === 'high' ? 'error' : currentTask.urgency === 'medium' ? 'warning' : 'success'}>
              {currentTask.urgency} urgency
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{currentTask.title}</h1>
          <p className="text-gray-600 mt-1">Posted {new Date(currentTask.createdAt).toLocaleDateString()}</p>
        </div>

        {isClient && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit size={18} className="mr-2" />
              Edit
            </Button>
            <Button variant="error">
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{currentTask.description}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <DollarSign size={20} className="text-success mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-800">${currentTask.budget}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock size={20} className="text-primary mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-semibold text-gray-800">{currentTask.category}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin size={20} className="text-secondary mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-800">{currentTask.location}</p>
                </div>
              </div>
              {currentTask.requiredSkills && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTask.requiredSkills.map((skill, idx) => (
                      <Badge key={idx} variant="default">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Applications (for client) */}
          {isClient && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Applications</h2>
                {pendingApplications.length > 0 && (
                  <Badge variant="warning">{pendingApplications.length} pending</Badge>
                )}
              </div>
              
              {appsLoading ? (
                <p>Loading...</p>
              ) : applications.length === 0 ? (
                <p className="text-gray-600">No applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Worker #{app.workerId}</p>
                          <p className="text-sm text-gray-600">${app.price} • {app.deliveryTime}</p>
                          <p className="text-sm text-gray-600 mt-2">{app.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === 'pending' ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="success"
                                onClick={() => handleAcceptApplication(app.id)}
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="error"
                                onClick={() => handleRejectApplication(app.id)}
                              >
                                <XCircle size={16} className="mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Badge variant={getStatusBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            {isWorker && currentTask.status === 'published' && !hasApplied && (
              <Button 
                className="w-full" 
                onClick={() => setShowApplyModal(true)}
              >
                <Send size={18} className="mr-2" />
                Apply for Task
              </Button>
            )}
            
            {isWorker && hasApplied && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle size={24} className="mx-auto text-success mb-2" />
                <p className="text-gray-800 font-medium">Application Submitted</p>
                <p className="text-sm text-gray-600">Waiting for client response</p>
              </div>
            )}

            {currentTask.status !== 'published' && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">This task is no longer available</p>
              </div>
            )}
          </Card>

          {/* Client Info */}
          <Card title="Posted By">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-800">Client #{currentTask.clientId}</p>
                <Link 
                  to={`/profile/${currentTask.clientId}`} 
                  className="text-sm text-primary hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              <MessageSquare size={18} className="mr-2" />
              Message Client
            </Button>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal 
        isOpen={showApplyModal} 
        onClose={() => setShowApplyModal(false)}
        title="Apply for Task"
      >
        <form onSubmit={handleSubmit(handleApply)}>
          <Input
            label="Your Price ($)"
            type="number"
            placeholder="Enter your price"
            {...register('price', { required: true })}
          />
          <Input
            label="Delivery Time"
            placeholder="e.g., 2 days"
            {...register('deliveryTime', { required: true })}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to Client
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              placeholder="Introduce yourself and explain why you're the best fit..."
              {...register('message', { required: true })}
            ></textarea>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskDetail;

