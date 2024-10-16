import Theme from '../../../components/Theme/Theme';
import styles from './Events.module.css';
import { GoPeople } from 'react-icons/go';
import { BsArrowRight, BsThreeDots } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { duplicateEvent, setEventInfoLocal, getEvents } from '../../../apis/events';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import RightClickMenu from './RightClickMenu';
import Modal from '../../../components/Modal/Modal';
import { formatDate } from '../../../common/commonFunctions';

const Events = () => {
  interface Position {
    x: number;
    y: number;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [duplicateEventId, setDuplicateEventId] = useState<string>('');
  const handleButtonClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    setDuplicateEventId(event.currentTarget.id);
    setIsMenuOpen(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  enum EventStatus {
    Published = 'Published',
    Draft = 'Draft',
    Completed = 'Completed',
  }

  type Event = {
    id: string;
    title: string;
    members: number;
    logo: string | null;
    date: string;
    day: string;
    name: string;
    start_day: string;
    start_date: string;
    event_start_date: string;
    status: string;
  };

  const [events, setEvents] = useState([] as Event[]);

  useEffect(() => {
    getEvents(setEvents);
  }, []);

  const navigate = useNavigate();

  const handleClick = (eventName: string) => {
    setEventInfoLocal(eventName).then((eventData) => {
      if (eventData.current_user_role === 'Admin' || eventData.current_user_role === 'Owner') {
        navigate(`/${eventName}/overview/`);
      } else if (eventData.current_user_role === 'Volunteer') {
        navigate(`/${eventName}/checkins/`);
      }
    });
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <Theme>
        {showModal && (
          <Modal onClose={onModalClose}>
            <p className={styles.modalHeader}>Create Duplicate</p>
            <p className={styles.modalSubText}>
              Are you sure you want to create a duplicate event ?
            </p>
            <div className={styles.buttons}>
              <p
                onClick={() => {
                  duplicateEvent(duplicateEventId);
                  setShowModal(false);
                }}
                className={styles.button}
              >
                Create Duplicate
              </p>
              <p
                onClick={() => {
                  setShowModal(false);
                }}
                className={styles.button}
              >
                Cancel
              </p>
            </div>
          </Modal>
        )}
        <div className={styles.homeContainer}>
          {Object.values(EventStatus).map((status) => {
            return (
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={styles.homeHeader}
                >
                  {events.filter((event) => event.status == status).length > 0
                    ? `${status} Events`
                    : ''}
                </motion.p>
                <div className={styles.eventsContainer}>
                  {events
                    .filter((event) => event.status == status)
                    .map((event) => (
                      <div key={event.id} className={styles.event}>
                        <div>
                          <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={styles.eventCard}
                          >
                            <div className={styles.innerCard}>
                              {event.logo ? (
                                <motion.img
                                  initial={{ opacity: 0, y: 50 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5 }}
                                  src={event.logo}
                                  alt='event logo depicting event information'
                                  className={styles.eventImage}
                                />
                              ) : (
                                <div className={styles.eventImage}>
                                  {event.title.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className={styles.eventDetails}>
                                <div className={styles.eventDetailsHeader}>
                                  <div>
                                    <motion.div className={styles.eventDate}>
                                      <p className={styles.date}>
                                        {formatDate(event?.event_start_date)}
                                      </p>
                                    </motion.div>
                                    <p className={styles.eventName}>
                                      {event.title.substring(0, 40)}
                                      {event.title.length > 40 ? '...' : ''}
                                    </p>
                                  </div>
                                  {import.meta.env.VITE_CURRENT_ENV === 'dev' && (
                                    <BsThreeDots
                                      onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
                                        handleButtonClick(e);
                                        setDuplicateEventId(event?.id);
                                      }}
                                      size={15}
                                      color='#ffffff'
                                      className='pointer'
                                    />
                                  )}
                                </div>
                                {isMenuOpen && (
                                  <RightClickMenu
                                    isOpen={isMenuOpen}
                                    position={menuPosition}
                                    onClose={handleMenuClose}
                                    setShowModal={setShowModal}
                                  />
                                )}
                                <p className={styles.eventGuests}>
                                  <span>
                                    <GoPeople color='a4a4a4' />
                                  </span>
                                  {event.members} guests
                                </p>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  className={styles.manage}
                                  onClick={() => {
                                    handleClick(event.name);
                                  }}
                                >
                                  Manage
                                  <BsArrowRight size={15} />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </Theme>
    </>
  );
};

export default Events;
