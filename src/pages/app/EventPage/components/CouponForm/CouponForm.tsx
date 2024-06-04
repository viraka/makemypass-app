import React, { useEffect, useState } from 'react';
import { CouponData, DiscountData, Tickets } from '../../types';
import { EventType, FormDataType, TicketType } from '../../../../../apis/types';
import styles from './CouponForm.module.css';
import { discountedTicketPrice, getIcon } from '../../constants';
import InputFIeld from '../../../../auth/Login/InputFIeld';
import SecondaryButton from '../../../Overview/components/SecondaryButton/SecondaryButton';
import { motion } from 'framer-motion';
import { applyCoupon } from '../../../../../apis/publicpage';

import 'react-datepicker/dist/react-datepicker.css';
import SelectDate from '../../../../../components/SelectDate/SelectDate';
import toast from 'react-hot-toast';
import { findMinDate } from '../../../../../common/commonFunctions';
import { validateCondition } from '../../../../../components/DynamicForm/condition';

const CouponForm = ({
  ticketInfo,
  setTickets,
  tickets,
  eventId,
  discount,
  setDiscount,
  setAmount,
  eventData,
  setCoupon,
  coupon,
  setSelectedDate,
  selectedDate,
  updateTicketCount,
  formData,
  setNoTickets,
}: {
  ticketInfo: TicketType[];
  setTickets: React.Dispatch<React.SetStateAction<Tickets[]>>;
  tickets: Tickets[];
  eventId: string;
  discount: DiscountData;
  setDiscount: React.Dispatch<React.SetStateAction<DiscountData>>;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  eventData: EventType | undefined;
  setCoupon: React.Dispatch<React.SetStateAction<CouponData>>;
  coupon: CouponData;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  selectedDate: string | null | undefined;
  updateTicketCount: (ticketId: string, increment: boolean) => void;
  formData: FormDataType;
  setNoTickets: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleDateChange = (date: string | null | undefined | Date) => {
    let newDate;
    if (date) newDate = new Date(date);

    if (newDate && eventData) {
      setSelectedDate(newDate.toISOString().split('T')[0]);
    }

    getTickets();
  };

  // const [firstRender, setFirstRender] = React.useState(true);

  const [ticketsWithId, setTicketsWithId] = useState({});
  const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    if (eventData) handleDateChange(findMinDate(eventData));

    setNoTickets(true);
  }, [eventData]);

  const getTickets = () => {
    const tempList: TicketType[] = [];
    eventData?.tickets.forEach((ticket) => {
      if (ticket.conditions) {
        if (validateCondition(ticket.conditions, formData, eventData.form)) {
          tempList.push(ticket);
        }
      } else {
        tempList.push(ticket);
      }
    });
    setFilteredTickets([])
    console.log(discount)
    tempList.forEach((ticket) => {
      if (ticket.entry_date && ticket.entry_date.length > 0) {
        ticket.entry_date.forEach((date) => {
          if (selectedDate === date.date) {
            const updatedTicket = {
              ...ticket,
              capacity: date.capacity ? date.capacity : ticket.capacity,
              price: date.price ? date.price : ticket.price,
              show_price: date.show_price ? date.show_price : ticket.show_price,
            };

            setFilteredTickets((prevTickets) => {
              return [...prevTickets, updatedTicket];
            });
          }
        });
      } else {
        setFilteredTickets((prevTickets) => {
          return [...prevTickets, ticket];
        });
      }
    });
  };

  useEffect(() => {
    console.log(filteredTickets);
  }, [filteredTickets]);

  useEffect(() => {
    getTickets();
  }, [eventData]);

  useEffect(() => {
    getTickets();
  }, [discount]);

  return (
    <>
      {coupon.status && (
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className={`${styles.row} ${styles.ticketType}`}
          style={{
            marginTop: '0rem',
            border: discount.discount_value > 0 ? '2px solid #46BF75' : '2px solid #2A3533',
          }}
        >
          <InputFIeld
            name='coupon_code'
            placeholder='Coupon Code'
            id='coupon_code'
            key='coupon_code'
            error={[coupon.error ?? '']}
            onChange={(e) => {
              setCoupon({
                ...coupon,
                error: '',
                value: e.target.value,
              });
            }}
            type='text'
            icon={getIcon('coupon_code')}
            required={true}
            description={coupon.description}
            style={{
              marginTop: '-1rem',
              border:
                discount.discount_value > 0 && discount.ticket.length > 0
                  ? '2px solid #46BF75'
                  : '2px solid #2A3533',
            }}
          />
          {discount.discount_type && discount.discount_value > 0 && (
            <p
              style={{
                marginTop: '-1.75rem',
              }}
              className={styles.discountText}
            >
              {discount.discount_type.toLowerCase() === 'percentage'
                ? `${discount.discount_value}% discount applied`
                : `${discount.discount_value} ${filteredTickets[0].currency} discount applied`}
            </p>
          )}

          <div>
            <SecondaryButton
              onClick={() => {
                if (coupon.value) applyCoupon(eventId, coupon, setDiscount, setCoupon);
                else {
                  setCoupon({
                    ...coupon,
                    error: 'Please enter a coupon code',
                  });
                }
              }}
              buttonText='Validate Code'
            />
          </div>
        </motion.div>
      )}

      {eventData?.tickets[0]?.entry_date && eventData?.tickets[0]?.entry_date.length > 0 && (
        <SelectDate
          eventData={eventData}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className={styles.ticketTypes}
      >
        <div
          style={{
            marginLeft: '8px',
          }}
        >
          <p className={styles.ticketTypesTitle}>Ticket Types</p>
          <p className={styles.eventDescription}>Select a ticket type to register for the event.</p>
        </div>

        {filteredTickets?.map((filteredTicket) => {
          const hasCapacity = filteredTicket.entry_date.find(
            (entry) => entry.date === selectedDate,
          )?.capacity;

          if (
            ((hasCapacity && hasCapacity > 0) || !hasCapacity) &&
            eventData &&
            validateCondition(filteredTicket.conditions, formData, eventData?.form)
          ) {
            // if (firstRender) {
            //   setNoTickets(false);

            //   setTickets([
            //     { ticket_id: eventData?.tickets[ticketType].id, count: 1, my_ticket: true },
            //   ]);
            //   setAmount(eventData?.tickets[ticketType].price.toString());
            //   setFirstRender(false);
            // }

            return (
              <div
                key={filteredTicket.id}
                onClick={() => {
                  if (eventData?.select_multi_ticket) {
                    let newTicketIds = []; //temporary variable to store new ticket ids for amount updation

                    if (
                      tickets.filter((ticket) => ticket.ticket_id === filteredTicket.id).length > 0
                    ) {
                      setTickets(
                        tickets.filter((ticket) => ticket.ticket_id !== filteredTicket.id),
                      );
                      newTicketIds = tickets.filter(
                        (ticket) => ticket.ticket_id !== filteredTicket.id,
                      );
                    } else {
                      setTickets([
                        ...tickets,
                        {
                          ticket_id: filteredTicket.id,
                          count: 1,
                          my_ticket: true,
                        },
                      ]);
                      newTicketIds = [...tickets, filteredTicket.id];
                    }

                    if (
                      discount.discount_value > 0 &&
                      discount.ticket.includes(filteredTicket.id)
                    ) {
                      const amount = newTicketIds.reduce((acc, ticket) => {
                        const ticketId = typeof ticket === 'string' ? ticket : ticket.ticket_id;
                        return (
                          acc +
                          discountedTicketPrice(
                            Object.values(ticketInfo).filter(
                              (ticktype) => ticktype.id === ticketId,
                            )[0].price,
                            discount,
                            ticketId,
                          )
                        );
                      }, 0);
                      setAmount(amount.toString());
                    } else {
                      const amount = newTicketIds.reduce((acc, id) => {
                        return (
                          acc +
                          Number(
                            Object.values(ticketInfo).filter((ticktype) => ticktype.id === id)[0]
                              .price,
                          )
                        );
                      }, 0);
                      setAmount(amount.toString());
                    }
                  } else {
                    const ticketAlreadyThere =
                      tickets.filter((ticket) => ticket.ticket_id === filteredTicket.id).length > 0;

                    if (ticketAlreadyThere) {
                      if (eventData?.is_grouped_ticket)
                        setTickets(
                          tickets.map((ticket) => ({
                            ...ticket,
                            my_ticket: ticket.ticket_id === filteredTicket.id ? true : false,
                          })),
                        );
                      else
                        setTickets([
                          {
                            ticket_id: filteredTicket.id,
                            count: 1,
                            my_ticket: true,
                          },
                        ]);
                    } else {
                      if (eventData?.is_grouped_ticket) {
                        const updatedTickets = tickets.map((ticket) => ({
                          ...ticket,
                          my_ticket: false,
                        }));

                        updatedTickets.push({
                          ticket_id: filteredTicket.id,
                          count: 1,
                          my_ticket: true,
                        });

                        setTickets(updatedTickets);
                      } else {
                        setTickets([
                          {
                            ticket_id: filteredTicket.id,
                            count: 1,
                            my_ticket: true,
                          },
                        ]);
                      }
                    }

                    if (discount.discount_value > 0 && discount.ticket.includes(filteredTicket.id))
                      setAmount(
                        discountedTicketPrice(
                          Number(
                            filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                              ?.price || filteredTicket.price,
                          ),
                          discount,
                          filteredTicket.id,
                        ).toString(),
                      );
                    else {
                      setAmount(
                        (
                          filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                            ?.price || filteredTicket.price
                        ).toString(),
                      );
                    }
                  }
                }}
                className={styles.ticketType}
                style={{
                  border: tickets.find(
                    (ticket) => ticket.my_ticket && ticket.ticket_id === filteredTicket.id,
                  )
                    ? '2px solid #FFFFFF'
                    : '2px solid #2A3533',
                }}
              >
                {eventData?.select_multi_ticket && tickets && (
                  <>
                    <div className={styles.ticketCountContainer}>
                      <div
                        className='row'
                        style={{
                          columnGap: 0,
                        }}
                      >
                        <button
                          className={styles.ticketCountUpdateButton}
                          onClick={() => {
                            updateTicketCount(filteredTicket.id, false);
                          }}
                        >
                          -
                        </button>
                        <p className={styles.ticketCount}>
                          {tickets.find((ticket) => ticket.ticket_id === filteredTicket.id)
                            ?.count ?? 0}
                        </p>
                        <button
                          className={styles.ticketCountUpdateButton}
                          onClick={() => {
                            const currentTicketCount = tickets.find(
                              (ticket) => ticket.ticket_id === filteredTicket.id,
                            )?.count;

                            const ticketLimit = filteredTicket.entry_date?.find(
                              (entryDate) => entryDate.date === selectedDate,
                            )?.capacity;

                            if (currentTicketCount === ticketLimit) {
                              toast.error('Ticket limit reached');
                              return;
                            }
                            updateTicketCount(filteredTicket.id, true);
                          }}
                        >
                          +
                        </button>
                      </div>

                      {filteredTicket.entry_date?.map((entryDate) => {
                        return (
                          entryDate.date === selectedDate &&
                          entryDate.capacity <= 10 && (
                            <div key={entryDate.date} className={styles.dateContainer}>
                              <p className={styles.capacity}>{entryDate.capacity} tickets left</p>
                            </div>
                          )
                        );
                      })}
                    </div>
                  </>
                )}

                <div className={styles.passText}>
                  <p className={styles.ticketTypeTitle}>{filteredTicket.title?.toUpperCase()}</p>
                  <p className={styles.ticketTypeDescription}>{filteredTicket.description}</p>
                  <div className={styles.perks}>
                    {Object.keys(filteredTicket.perks)?.map((perk) => (
                      <div key={perk} className={styles.perk}>
                        {perk}: {filteredTicket.perks[perk]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.ticketPriceData}>
                  {discount.discount_value > 0 &&
                    (filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                      ?.price || filteredTicket.price) > 0 &&
                    discount.ticket.includes(filteredTicket.id) && (
                      <div className={styles.discountData}>
                        <p className={styles.discountAmount}>
                          {discount.discount_type.toLowerCase() === 'percentage'
                            ? `${discount.discount_value}% off`
                            : `${filteredTicket.currency} ${discount.discount_value} off`}
                        </p>
                        <p className={styles.originalPrice}>
                          <del>
                            M.R.P. {filteredTicket.currency}{' '}
                            {filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                              ?.price || filteredTicket.price}
                          </del>
                        </p>
                      </div>
                    )}

                  <div className={styles.priceData}>
                    <p className={styles.ticketPrice}>
                      {discountedTicketPrice(
                        Number(
                          filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                            ?.price || filteredTicket.price,
                        ),
                        discount,
                        filteredTicket.id,
                      ) === 0
                        ? 'FREE'
                        : `${filteredTicket.currency} ${discountedTicketPrice(
                            Number(
                              filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                                ?.price || filteredTicket.price,
                            ),
                            discount,
                            filteredTicket.id,
                          )}`}
                    </p>
                    <p className={styles.extraCharges}>
                      {filteredTicket.platform_fee_from_user &&
                        Number(
                          filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                            ?.price || filteredTicket.price,
                        ) > 0 &&
                        discountedTicketPrice(
                          Number(
                            filteredTicket.entry_date.find((entry) => entry.date === selectedDate)
                              ?.price || filteredTicket.price,
                          ),
                          discount,
                          filteredTicket.id,
                        ) !== 0 && (
                          <p className={styles.extraCharges}>
                            {filteredTicket.platform_fee}% extra charges
                          </p>
                        )}
                    </p>
                  </div>
                  {
                    /*Check for Show price if discount value is 0 and show it if available*/
                    !discount.discount_value &&
                      (filteredTicket.entry_date.find((entry) => entry.date == selectedDate)
                        ?.show_price ||
                        filteredTicket.show_price) && (
                        <div className={styles.discountData}>
                          <p className={styles.marketingOriginalPrice}>
                            <del>
                              M.R.P. {filteredTicket.currency}{' '}
                              {filteredTicket.entry_date.find((entry) => entry.date == selectedDate)
                                ?.show_price || filteredTicket.show_price}{' '}
                              {/*Show price if available*/}
                            </del>
                          </p>
                        </div>
                      )
                  }
                </div>

                <p className={styles.cardText}>{eventData?.title?.toUpperCase()}</p>
              </div>
            );
          }
        })}
      </motion.div>
    </>
  );
};

export default CouponForm;
