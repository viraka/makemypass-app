import { motion } from 'framer-motion';
import styles from './SuccessModal.module.css';
import Modal from '../../../../../components/Modal/Modal';
import { Dispatch, SetStateAction } from 'react';
import { SuccessModalProps } from '../../types';
import { HashLoader } from 'react-spinners';
import { BsDownload } from 'react-icons/bs';

const SuccessModal = ({
  success,
  setSuccess,
}: {
  success: SuccessModalProps;
  setSuccess: Dispatch<SetStateAction<SuccessModalProps>>;
}) => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className={styles.successMessage}
      >
        {success && success.showModal && (
          <>
            <Modal>
              <div className={styles.modalContainer}>
                <button
                  onClick={() => {
                    setSuccess({ showModal: false });
                  }}
                  className={styles.closeButton}
                >
                  X
                </button>

                {!success.loading ? (
                  <div className={styles.modalTexts}>
                    <p className={styles.modalTitle}>Booking Confirmed!</p>
                    <p className={styles.bookingConfirmedSubText}>
                      Thank you for booking your spot at {success.eventTitle}!
                    </p>
                    <p className={styles.bookingConfirmedSecondaryText}>
                      {success.followupMessage}
                    </p>

                    {success.ticketURL && (
                      <>
                        <button
                          onClick={() => {
                            if (success.ticketURL) {
                              fetch(success.ticketURL)
                                .then((response) => response.blob())
                                .then((blob) => {
                                  const link = document.createElement('a');
                                  link.href = window.URL.createObjectURL(blob);
                                  link.download = 'Ticket.png';
                                  link.click();
                                })
                                .catch((error) =>
                                  console.error('Error downloading the ticket:', error),
                                );
                            }
                          }}
                          className={styles.downloadTicketButton}
                        >
                          <BsDownload /> <span>Download Ticket</span>
                        </button>
                        <button
                          onClick={() => {
                            window.open(success.ticketURL, '_blank');
                          }}
                          className={styles.viewTicketButton}
                        >
                          View Ticket
                        </button>
                      </>
                    )}

                    <p className={styles.contactUs}>
                      If you have any questions or need assistance, please contact us at
                      hello@makemypass.com
                    </p>
                  </div>
                ) : (
                  <div className={styles.loaderContainer}>
                    <HashLoader color='#46BF75' size={50} />
                  </div>
                )}
              </div>
            </Modal>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SuccessModal;
