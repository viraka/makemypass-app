import { motion } from 'framer-motion';
import styles from './SuccessModal.module.css';
import Modal from '../../../../../components/Modal/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { SuccessModalProps } from '../../types';
import { HashLoader } from 'react-spinners';
import { BsDownload } from 'react-icons/bs';
import ScratchCard from './ScratchCardComponent/ScratchCardComponent';
import image from './scratchImage.png';
import { claimRegisterGift } from '../../../../../apis/publicpage';

const SuccessModal = ({
  success,
  setSuccess,
}: {
  success: SuccessModalProps;
  setSuccess: Dispatch<SetStateAction<SuccessModalProps>>;
}) => {
  const [scratchCard, setScratchCard] = useState(false);

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

                    {success.ticketURL && import.meta.env.VITE_CURRENT_ENV === 'dev' && (
                      <>
                        <button
                          onClick={() => {
                            if (success.ticketURL) {
                              fetch(success.ticketURL, {
                                headers: {
                                  'Access-Control-Allow-Origin': '*',
                                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                                  'Access-Control-Allow-Headers': 'Content-Type',
                                },
                              })
                                .then((response) => response.blob())
                                .then((blob) => {
                                  console.log(blob);
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
                          className={styles.downloadTicketButton}
                        >
                          View Ticket
                        </button>
                      </>
                    )}

                    <p className={styles.contactUs}>
                      If you have any questions or need assistance, please contact us at
                      hello@makemypass.com
                    </p>

                    <button
                      onClick={() => {
                        setSuccess({ showModal: false });
                        setScratchCard(true);
                        if (success.eventRegisterId)
                          claimRegisterGift(success.eventId ?? '', success.eventRegisterId);
                      }}
                      className={styles.viewTicketButton}
                    >
                      Next
                    </button>
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

        {!success.showModal && scratchCard && (
          <Modal
            title='Scratch Card'
            onClose={() => {
              setScratchCard(false);
            }}
          >
            <div className={styles.scratchCardContainer}>
              <div className={styles.scratchCard}>
                <p className={styles.modalTitle}>Scratch to Reveal</p>
                <p className={styles.bookingConfirmedSubText}>
                  Scratch the card to reveal your discount code
                </p>
                <div className={styles.scratchCardImage}></div>

                <ScratchCard
                  width={150}
                  height={150}
                  coverImage={image}
                  revealContent='Congratulations! You won!'
                  brushSize={30}
                  revealThreshold={70}
                />
              </div>
            </div>
          </Modal>
        )}
      </motion.div>
    </div>
  );
};

export default SuccessModal;
