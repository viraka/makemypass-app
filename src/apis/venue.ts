import { Dispatch } from 'react';
import { privateGateway } from '../../services/apiGateway';
import { makeMyPass } from '../../services/urls';
import toast from 'react-hot-toast';
import { VenueType } from '../pages/app/CheckIns/pages/Venue/types';
import { LogType } from '../pages/app/CheckIns/pages/Venue/Venue';
import { formatDate } from '../common/commonFunctions';

export const listVenues = async (
  eventId: string,
  setVenue: Dispatch<React.SetStateAction<VenueType[]>>,
) => {
  privateGateway
    .get(makeMyPass.listVenues(eventId))
    .then((response) => {
      setVenue(response.data.response.venues);
    })
    .catch((error) => {
      toast.error(error.response.data.message.general[0] || 'Unable to process the request');
    });
};

export const checkInUserVenue = async (
  ticketCode: string,
  eventId: string,
  selectedVenue: VenueType | null,
  setScanLogs: Dispatch<React.SetStateAction<LogType[]>>,
) => {
  if (selectedVenue)
    privateGateway
      .post(makeMyPass.checkInUserVenue(ticketCode, eventId), {
        venue_id: selectedVenue?.id,
      })
      .then((response) => {
        toast.success(response.data.message.general[0] || 'User checked in successfully');
        setScanLogs((prev) => [
          ...prev,
          {
            message: `${ticketCode}: ${response.data.message.general[0]}`,
            timestamp: formatDate(new Date().toString(), true),
            hasError: false,
          },
        ]);
      })
      .catch((error) => {
        toast.error(error.response.data.message.general[0] || 'Unable to process the request');

        setScanLogs((prev) => [
          ...prev,
          {
            message: `${ticketCode}: ${error.response.data.message.general[0]}`,
            timestamp: formatDate(new Date().toString(), true),
            hasError: true,
          },
        ]);
      });
  else {
    toast.error('Please select a venue to check-in');
  }
};
