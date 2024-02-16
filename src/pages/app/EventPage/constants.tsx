import { BsSuitcaseLg } from 'react-icons/bs';
import { GoPerson } from 'react-icons/go';
import { IoCallOutline } from 'react-icons/io5';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { RiCoupon3Line } from 'react-icons/ri';

export const customStyles = {
  control: (provided: any) => ({
    ...provided,
    border: 'none',
    backgroundColor: '#2A3533',
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '0.9rem',
  }),

  group: (provided: any) => ({
    ...provided,
    paddingTop: 0,
  }),

  singleValue: (base: any) => ({
    ...base,
    color: '#fff',
  }),
  option: (provided: any) => ({
    ...provided,
    fontFamily: 'Inter, sans-serif',
    color: '#000',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '0.9rem',
  }),
};

export const getIcon = (type: string) => {
  switch (type) {
    case 'name':
      return (
        <GoPerson
          size={20}
          style={{
            color: '#9E9E9E',
          }}
        />
      );
    case 'phone_number':
      return (
        <IoCallOutline
          size={20}
          style={{
            color: '#9E9E9E',
          }}
        />
      );
    case 'email':
      return (
        <MdOutlineAlternateEmail
          size={20}
          style={{
            color: '#9E9E9E',
          }}
        />
      );
    case 'organisation_campus':
      return (
        <BsSuitcaseLg
          size={20}
          style={{
            color: '#9E9E9E',
          }}
        />
      );
    case 'coupon_code':
      return (
        <RiCoupon3Line
          size={20}
          style={{
            color: '#9E9E9E',
          }}
        />
      );
  }
};
