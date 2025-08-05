export const darkSelectStyles = {
  control: (base: any, state: { isFocused: any; }) => ({
    ...base,
    minHeight: '0',
    height: '28px',
    padding: '2px 6px',
    borderRadius: '0.5rem',
    backgroundColor: '#5C606B',
    borderColor: state.isFocused ? '#8C8F99' : '#5C606B',
    boxShadow: 'none',
    fontSize: '0.875rem',
    color: '#FFFFFF',
  }),
  input: (base: any) => ({
    ...base,
    color: '#FFFFFF',
    padding: 0,
    margin: 0,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 0.5rem',
    color: '#FFFFFF',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#D1D5DB',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#FFFFFF',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: '#FFFFFF',
    padding: '2px',
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: '#FFFFFF',
    padding: '2px',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1F2937',
    border: '1px solid #5C606B',
    zIndex: 20,
  }),
  option: (base: any, state: { isFocused: any; }) => ({
    ...base,
    backgroundColor: state.isFocused ? '#374151' : 'transparent',
    color: '#FFFFFF',
    cursor: 'pointer',
  }),
};
