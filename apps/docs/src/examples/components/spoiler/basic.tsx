import { Spoiler, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Spoiler maxHeight={96}>
      <Text>
        The trail starts at the visitor center and climbs through pine forest for the first two miles. Past the second bridge it
        leaves the trees and follows the ridge, with views of the valley on both sides.
      </Text>
      <Text>
        The last mile is steep and rocky: wear boots with a good grip, and carry water, since there is none above the bridge. Most
        hikers reach the summit in three hours and are back at the car by mid-afternoon.
      </Text>
      <Text>
        In winter the ridge is often icy. Check the conditions at the visitor center before you start, and turn back if the wind
        picks up.
      </Text>
    </Spoiler>
  );
}
