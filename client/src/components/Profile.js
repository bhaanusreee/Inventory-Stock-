import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { updateProfile, updateSocialLinks, updateAvatar } from '../redux/slices/profileSlice';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaPen } from 'react-icons/fa';
import '../styles/profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...profile,
    socialLinks: profile?.socialLinks || {
      linkedin: '',
      twitter: '',
      github: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
    dispatch(updateSocialLinks(formData.socialLinks));
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateAvatar(reader.result));
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  // Ensure we have default values for profile data
  const displayProfile = {
    name: profile?.name || 'Your Name',
    email: profile?.email || 'Not set',
    role: profile?.role || 'Role',
    company: profile?.company || 'Company',
    location: profile?.location || 'Not set',
    phone: profile?.phone || 'Not set',
    bio: profile?.bio || 'No bio available',
    avatar: profile?.avatar || 'https://via.placeholder.com/150',
    socialLinks: profile?.socialLinks || {
      linkedin: '',
      twitter: '',
      github: ''
    }
  };

  return (
    <Container className="profile-container py-4">
      {/* Profile Header */}
      <Card className="profile-header mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} md={3} className="text-center">
              <div className="profile-avatar-container">
                <img
                  src={displayProfile.avatar}
                  alt="Profile"
                  className="profile-avatar"
                />
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="avatar-input"
                  />
                )}
              </div>
            </Col>
            <Col xs={12} md={7}>
              <h2 className="mb-1">{displayProfile.name}</h2>
              <p className="text-muted mb-2">{displayProfile.role}</p>
              <p className="mb-0">
                <FaBuilding className="me-2" />
                {displayProfile.company}
              </p>
            </Col>
            <Col xs={12} md={2} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                <FaPen className="me-2" />
                Edit Profile
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Profile Information */}
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Personal Information</h4>
              <Row className="mb-3">
                <Col sm={6}>
                  <p className="text-muted mb-1">
                    <FaEnvelope className="me-2" />
                    Email
                  </p>
                  <p className="mb-3">{displayProfile.email}</p>
                </Col>
                <Col sm={6}>
                  <p className="text-muted mb-1">
                    <FaPhone className="me-2" />
                    Phone
                  </p>
                  <p className="mb-3">{displayProfile.phone}</p>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <p className="text-muted mb-1">
                    <FaMapMarkerAlt className="me-2" />
                    Location
                  </p>
                  <p>{displayProfile.location}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h4 className="mb-4">About</h4>
              <p>{displayProfile.bio}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Social Links Card */}
          <Card>
            <Card.Body>
              <h4 className="mb-4">Social Links</h4>
              {Object.entries(displayProfile.socialLinks).map(([platform, url]) => (
                <div key={platform} className="social-link mb-2">
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {platform}
                    </a>
                  ) : (
                    <span className="text-muted">No {platform} profile set</span>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal 
        show={isEditing} 
        onHide={() => {
          setIsEditing(false);
          setFormData({
            ...profile,
            socialLinks: profile?.socialLinks || {
              linkedin: '',
              twitter: '',
              github: ''
            }
          });
        }} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} className="profile-form">
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    type="text"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your company"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Write something about yourself"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="social-links-form">
              <h3>Social Links</h3>
              {Object.entries(formData.socialLinks || {}).map(([platform, url]) => (
                <div key={platform} className="form-group mb-3">
                  <Form.Label>{platform}:</Form.Label>
                  <Form.Control
                    type="url"
                    name={platform}
                    value={url || ''}
                    onChange={handleSocialLinkChange}
                    placeholder={`Enter your ${platform} profile URL`}
                  />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  ...profile,
                  socialLinks: profile?.socialLinks || {
                    linkedin: '',
                    twitter: '',
                    github: ''
                  }
                });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Profile;