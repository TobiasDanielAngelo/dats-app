import { Slider, SliderProps, Stack } from "@mui/material";

interface MySliderProps extends SliderProps {
  value: number;
  setValue: (t: number) => void;
  onChangeSlideDone?: (t: number) => void;
  title: string;
}

export const MySlider: React.FC<MySliderProps> = ({ ...props }) => {
  const { title, value, setValue, onChangeSlideDone, ...etc } = props;
  return (
    <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
      <span>{title}</span>
      <Slider
        valueLabelDisplay="auto"
        value={value}
        onChange={(_, v) => setValue(v as number)}
        onChangeCommitted={(_, v) =>
          onChangeSlideDone
            ? onChangeSlideDone(v as number)
            : setValue(v as number)
        }
        min={8}
        max={60}
        {...etc}
      />
    </Stack>
  );
};
