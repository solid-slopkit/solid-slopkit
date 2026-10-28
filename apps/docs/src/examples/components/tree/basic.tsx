import { Tree } from '@solid-slopkit/components';
import { files } from './data';

export default function Basic() {
  return <Tree data={files} aria-label="Files" defaultExpanded={['src']} />;
}
