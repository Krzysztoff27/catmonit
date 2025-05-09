import { Title, Select, SelectProps } from '@mantine/core';
import { DeviceDiskData } from '../../types/api.types';
import { IconCheck } from '@tabler/icons-react';
import { Flex, Text } from '@mantine/core';

type DeviceSelectProps = {
  title?: string;
  placeholder: string;
  data: DeviceDiskData[];
  value: string | null;
  onChange: (value: string | null) => void;
};

export default function DeviceSelect({
  title = 'Target',
  placeholder,
  data,
  value,
  onChange,
}: DeviceSelectProps) {
  const selectData = data.map((device) => ({
    value: device.uuid,
    label: `${device.hostname} (${device.ip}${device.mask})`,
  }));

  const renderOption: SelectProps['renderOption'] = ({ option, checked }) => {
    const device = data.find((d) => d.uuid === option.value);
    return (
      <Flex align="center" justify="space-between" w="100%">
        <Flex gap="xs" align="center">
          {checked && <IconCheck size={16} />}
          <Text fz = "sm">{device?.hostname}</Text>
        </Flex>
        <Text fz = "sm" c="var(--background-color-3)" 
         style={{ fontFamily: 'monospace' }}>
          {device?.ip} {device?.mask}
        </Text>
      </Flex>
    );
  };

  return (
    <>
      <Title order={4} mb="sm">
        {title}
      </Title>
      <Select
        placeholder={placeholder}
        data={selectData}
        value={value}
        onChange={onChange}
        renderOption={renderOption}
      />
    </>
  );
}
