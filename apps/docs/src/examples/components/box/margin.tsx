import { Box } from '@solid-slopkit/components';

const container = { border: '1px dashed currentColor', 'align-self': 'stretch' };
const surface = { background: 'var(--slp-color-base-200)' };

export default function Margin() {
  return (
    <>
      <Box style={container}>
        <Box m={4} p={2} style={surface}>
          {'m={4}'}
        </Box>
      </Box>
      <Box style={container}>
        <Box mx={10} my={2} p={2} style={surface}>
          {'mx={10} my={2}'}
        </Box>
      </Box>
      <Box style={container}>
        <Box mx="auto" p={2} style={{ ...surface, width: '50%' }}>
          {'mx="auto"'}
        </Box>
      </Box>
      <Box p={4} style={container}>
        <Box mx={-4} p={2} style={surface}>
          {'mx={-4} inside p={4}'}
        </Box>
      </Box>
    </>
  );
}
