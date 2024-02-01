import toast from 'react-hot-toast';
import { privateGateway } from '../../services/apiGateway';
import { makeMyPass } from '../../services/urls';
import { Event } from './types'; // Assuming Event is the type for events

export const getEvents = async (setEvents: React.Dispatch<React.SetStateAction<Event[]>>) => {
  privateGateway
    .get(makeMyPass.listEvents)
    .then((response) => {
      setEvents(response.data.response.events);
    })
    .catch((error) => {
      toast.error(error.response.data.message.general[0] || 'Unable to process the request');
    });
};

export const getEventId = async (eventName: string) => {
  privateGateway
    .get(makeMyPass.getEventId(eventName))
    .then((response) => {
      localStorage.setItem('eventData', JSON.stringify(response.data.response));
    })
    .catch((error) => {
      toast.error(error.response.data.message.general[0] || 'Unable to process the request');
    });
};

export const getEventData = async (
  eventId: string,
  setEventData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      date: string;
      role: string;
    }>
  >,
) => {
  privateGateway
    .get(makeMyPass.getEventData(eventId))
    .then((response) => {
      setEventData(response.data.response);
      localStorage.setItem('role', (response.data.response.role));
    })
    .catch((error) => {
      toast.error(error.response.data.message.general[0] || 'Unable to process the request');
    });
};
