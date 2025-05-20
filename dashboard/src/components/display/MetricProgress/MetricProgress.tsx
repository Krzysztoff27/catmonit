import { Stack, Text, Flex, Progress } from "@mantine/core";
import { formatBytes } from "../../../utils/formatBytes";

interface MetricProgressProps {
  label: string;
  used?: number;
  total?: number;
  isPercentage?: boolean;
}
 
export default function MetricProgress({
  label,
  used,
  total,
  isPercentage = false,
}: MetricProgressProps) {
  const isValid = typeof used === "number" && typeof total === "number" && total > 0;

  const percent = isValid ? (used! / total!) * 100 : 0;
  const color =
    percent > 90 ? "red" :
    percent > 75 ? "yellow" :
    "var(--mantine-color-text)";

  const valueDisplay = !isValid
    ? "N/A"
    : isPercentage
    ? `${percent.toFixed(1)}%`
    : `${formatBytes(used!)} / ${formatBytes(total!)}`;

  return (
    <Stack gap={0}>
      <Text fz="xs" fw={500} mb="-8px">
        {label}
      </Text>
      <Flex align="center" gap="sm">
        <Progress value={isValid ? percent : 0} color={color} size="sm" style={{ flex: 1 }} />
        <Text fz="sm" miw="120">
          {valueDisplay}
        </Text>
      </Flex>
    </Stack>
  );
}
