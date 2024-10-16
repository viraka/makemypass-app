import { HiUserGroup } from 'react-icons/hi2';
import { FaWrench } from 'react-icons/fa';
import { BsQrCodeScan } from 'react-icons/bs';
import Glance from '../../../../components/Glance/Glance';

import styles from './Overview.module.css';
import SectionButton from '../../../../components/SectionButton/SectionButton';
import { useEffect, useRef, useState } from 'react';

import { hostData, hostId, hostList, recentRegistration } from './types';

import { HashLoader } from 'react-spinners';
import { getHosts } from '../../../../apis/overview';
import { connectPrivateSocket } from '../../../../../services/apiGateway';
import { makeMyPassSocket } from '../../../../../services/urls';
import Theme from '../../../../components/Theme/Theme';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../../components/EventHeader/EventHeader';
import Table from '../../../../components/Table/Table';
import { TableType } from '../../../../components/Table/types';
import { transformTableData } from '../../../../common/commonFunctions';
import SecondaryButton from '../components/SecondaryButton/SecondaryButton';
import AddHosts from '../components/SecondaryButton/AddHosts/AddHosts';
import { addHosts, removeHost, updateHostRole } from '../../../../apis/host';
import { AnimatePresence } from 'framer-motion';
import Modal from '../../../../components/Modal/Modal';
import toast from 'react-hot-toast';
import { GuestsType, SelectedGuest } from '../../Guests/types';
import { FormDataType, FormFieldType } from '../../../../apis/types';
import ViewGuest from '../../Guests/components/ViewGuest/ViewGuest';
import { getFormFields } from '../../../../apis/publicpage';
import { downloadTicket } from '../../../../apis/guests';
import { isArray } from 'chart.js/helpers';

const Overview = () => {
  const [recentRegistrations, setRecentRegistrations] = useState<recentRegistration[]>([]);
  const [recentTableData, setRecentTableData] = useState<TableType[]>([]);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<SelectedGuest | null>({
    id: '',
    type: '',
  });

  const [selectedGuest, setSelectedGuest] = useState<GuestsType | null | TableType>(null);
  const [hostList, setHostList] = useState<hostList[]>([]);
  const [hostListTableData, setHostListTableData] = useState<TableType[]>([]);
  const [hostId, setHostId] = useState<hostId>({
    id: '',
    type: 'edit',
  });

  const [formData, setFormData] = useState<FormDataType>({});

  const { eventTitle } = useParams<{ eventTitle: string }>();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [hostData, setHostData] = useState<hostData>({
    email: '',
    role: '',
    is_private: true,
  });

  const { event_id: eventId } = JSON.parse(sessionStorage.getItem('eventData')!);
  const addRef = useRef<boolean>(false);
  const getGuestData = () => {
    const selectedGuestData = recentRegistrations.filter(
      (guest) => guest?.id === selectedGuestId?.id,
    );
    setSelectedGuest(selectedGuestData[0]);
    setFormData(selectedGuestData[0]);
  };

  const [formFields, setFormFields] = useState<FormFieldType[]>([]);

  useEffect(() => {
    if (eventId && hostList.length === 0) getHosts(eventId, setHostList);

    getFormFields(eventId, setFormFields);
  }, [eventId, hostList]);

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (selectedGuestId?.id && (selectedGuestId.type === 'edit' || selectedGuestId.type === 'view'))
      getGuestData();
    else if (
      selectedGuestId?.id &&
      selectedGuestId.type === 'download' &&
      !isArray(selectedGuestId.id)
    )
      if (selectedGuestId.id && selectedGuest?.name)
        downloadTicket(eventId, selectedGuestId?.id, selectedGuest?.name);
      else toast.error('Ticket download failed');
  }, [selectedGuestId]);

  useEffect(() => {
    if (eventId)
      connectPrivateSocket({
        url: makeMyPassSocket.recentRegistrations(eventId),
      }).then((ws) => {
        ws.onmessage = (event) => {
          if (JSON.parse(event.data).response.guests)
            setRecentRegistrations(JSON.parse(event.data).response.guests);
          else if (JSON.parse(event.data).response.data) {
            const newRegistration = JSON.parse(event.data).response.data;

            setRecentRegistrations((prev) => {
              const updatedRegistrations = [newRegistration, ...prev];
              updatedRegistrations.pop();
              return updatedRegistrations;
            });
          }
        };

        setSocket(ws);
      });
  }, [eventId]);

  useEffect(() => {
    const recentTableMapping = {
      id: 'id',
      name: 'name',
      email: 'email',
      category: 'category',
      registered_at: 'date',
      check_in_date: 'check_in_date',
      phonenumber: 'phonenumber',
      amount: 'amount',
      is_approved: 'is_approved',
      team_id: 'team_id',
    };

    if (recentRegistrations) {
      const transformedRecentRegistrations = transformTableData(
        recentTableMapping,
        recentRegistrations,
      );
      setRecentTableData(transformedRecentRegistrations as unknown as TableType[]);
    }
  }, [recentRegistrations]);

  useEffect(() => {
    const hostListMapping = {
      name: 'name',
      email: 'email',
      role: 'category',
      is_private: 'is_private',
      id: 'id',
    };
    if (hostList) {
      const transformedHostList = transformTableData(
        hostListMapping,
        hostList.map((host) => ({
          ...host,
          is_private: `${host.is_private}`,
        })),
      );
      setHostListTableData(transformedHostList as unknown as TableType[]);
    }
  }, [hostList]);

  useEffect(() => {
    if (hostId && hostId.type === 'edit' && hostId.id.length > 0) {
      const selectedHost = hostList.filter((host) => host.id === hostId.id)[0];

      setHostData((prevState) => ({
        ...prevState!,
        email: selectedHost?.email,
        role: selectedHost?.role,
        id: selectedHost?.id,
        is_private: selectedHost?.is_private,
      }));

      setOpenAddModal(true);
    }

    if (hostId && hostId.type === 'delete') {
      const selectedHost = hostList.filter((host) => host.id === hostId.id)[0];

      setHostData((prevState) => ({
        ...prevState!,
        email: selectedHost?.email,
        role: selectedHost?.role,
        is_private: selectedHost?.is_private,
        id: selectedHost?.id,
      }));
      setOpenDeleteModal(true);
    }
  }, [hostId]);

  const addHost = () => {
    addRef.current = true;
    setOpenAddModal(true);
  };

  const removeHostAccount = () => {
    removeHost(eventId, hostId.id, setOpenDeleteModal);
  };

  const onSubmit = () => {
    if (!hostData.id)
      addHosts(eventId, hostData.email, hostData.role, hostData.is_private, setHostData);
    if (hostData.id)
      updateHostRole(eventId, hostData.id, hostData.role, hostData.is_private, setHostData);
    setOpenAddModal(false);
  };
  const hostValidate: () => boolean = () => {
    if (!hostData.email) {
      toast.error('Email is required');
      return false;
    }
    if (!hostData.role) {
      toast.error('Role is required');
      return false;
    }
    return true;
  };

  const onClose = () => {
    setSelectedGuestId({
      id: '',
      type: '',
    });
  };

  const userRole = JSON.parse(sessionStorage.getItem('eventData')!).current_user_role;

  return (
    <Theme>
      {selectedGuestId && formData && selectedGuestId.id && selectedGuestId.type == 'view' && (
        <>
          <div onClick={onClose} className={styles.backgroundBlur}></div>
          <ViewGuest
            formFields={formFields}
            formData={formData}
            setSelectedGuestId={setSelectedGuestId}
            eventId={eventId}
            type='overview'
          />
        </>
      )}

      <>
        {openAddModal && (
          <AddHosts
            hostData={hostData}
            setHostData={setHostData}
            onSubmit={() => {
              if (hostValidate()) {
                onSubmit();
              }
              setHostData({ email: '', role: '', is_private: true });
              addRef.current = false;
            }}
            onClose={() => {
              setOpenAddModal(false);
              setHostData({ email: '', role: '', is_private: true });
              addRef.current = false;
            }}
            add={addRef.current}
          />
        )}
        {openDeleteModal && (
          <Modal
            onClose={() => {
              setOpenDeleteModal(false);
            }}
          >
            <p className={styles.modalHeader}>Remove Host</p>
            <p className={styles.modalSubText}>
              Are you sure you want to delete&nbsp;
              <span
                style={{
                  fontWeight: '600',
                  color: '#ff0c28',
                }}
              >
                {hostData.email}
              </span>
            </p>
            <div className={styles.buttons}>
              <p
                onClick={() => {
                  removeHostAccount();
                }}
                className={`pointer ${styles.button}`}
              >
                Remove Host
              </p>
              <p
                onClick={() => {
                  setOpenDeleteModal(false);
                }}
                className={`pointer ${styles.button}`}
              >
                Cancel
              </p>
            </div>
          </Modal>
        )}
        {recentRegistrations && hostList && recentRegistrations.length >= 0 ? (
          <div className={styles.overviewContainer}>
            <Header />
            <Glance tab='overview' />

            <div className={styles.buttons}>
              <Link to={`/${eventTitle}/guests`}>
                <SectionButton
                  buttonText='Guest List'
                  buttonColor='#7662FC'
                  icon={<HiUserGroup size={25} color='#7662FC' />}
                />
              </Link>

              {(userRole === 'Owner' || userRole === 'Admin') && (
                <a href='#hosts'>
                  <SectionButton
                    buttonText='Host List'
                    buttonColor='#C33D7B'
                    icon={<FaWrench size={25} color='#C33D7B' />}
                  />
                </a>
              )}

              <Link to={`/${eventTitle}/checkins`}>
                <SectionButton
                  buttonText='Check In'
                  buttonColor='#5B75FB'
                  icon={<BsQrCodeScan size={25} color='#5B75FB' />}
                />
              </Link>
            </div>

            <AnimatePresence>
              {recentTableData.length >= 0 && (
                <Table
                  tableHeading='Recent Registration'
                  tableData={recentTableData}
                  setSelectedGuestId={setSelectedGuestId}
                />
              )}
            </AnimatePresence>

            {(userRole === 'Admin' || userRole === 'Owner') && (
              <div id='hosts'>
                <Table
                  tableHeading='Event Hosts'
                  tableData={hostListTableData}
                  secondaryButton={<SecondaryButton buttonText='Add Hosts +' onClick={addHost} />}
                  setHostId={setHostId}
                />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.center}>
            <HashLoader color='#47C97E' size={50} />
          </div>
        )}
      </>
    </Theme>
  );
};

export default Overview;
