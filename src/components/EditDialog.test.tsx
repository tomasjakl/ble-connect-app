import React from 'react';
import {render, fireEvent, waitFor} from 'utils/testUtils';
import EditDialog from './EditDialog';

jest.useFakeTimers();

describe('EditDialog', () => {
  const mockOnDismiss = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    visible: true,
    onDismiss: mockOnDismiss,
    description: 'Test Description',
    value: 'Test Value',
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with string value', () => {
    const {getByText, getByDisplayValue} = render(
      <EditDialog {...defaultProps} />,
    );

    expect(getByText('Test Description')).toBeTruthy();
    expect(getByDisplayValue('Test Value')).toBeTruthy();
  });

  it('renders correctly with number value', () => {
    const props = {
      ...defaultProps,
      value: 42,
    };

    const {getByText, getByDisplayValue} = render(<EditDialog {...props} />);

    expect(getByText('Test Description')).toBeTruthy();
    expect(getByDisplayValue('42')).toBeTruthy();
  });

  it('renders correctly with boolean value', () => {
    const props = {
      ...defaultProps,
      value: true,
    };

    const {getByRole} = render(<EditDialog {...props} />);

    expect(getByRole('switch')).toBeTruthy();
  });

  it('calls onDismiss when Close button is pressed', () => {
    const {getByText} = render(<EditDialog {...defaultProps} />);

    fireEvent.press(getByText('Close'));
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('shows Save button when value is edited', () => {
    const {getByText, getByDisplayValue} = render(
      <EditDialog {...defaultProps} />,
    );

    const input = getByDisplayValue('Test Value');
    fireEvent.changeText(input, 'New Value');

    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onSave when Save button is pressed', async () => {
    const {getByText, getByDisplayValue} = render(
      <EditDialog {...defaultProps} />,
    );

    const input = getByDisplayValue('Test Value');
    fireEvent.changeText(input, 'New Value');

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('New Value');
    });
  });
});
