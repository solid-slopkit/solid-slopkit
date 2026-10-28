import { File, Folder, FolderOpen } from '@lucide/solid';
import { Tree } from '@solid-slopkit/components';
import { files } from './data';

export default function RenderNode() {
  return (
    <Tree
      data={files}
      aria-label="Files with icons"
      defaultExpanded={['src', 'src/components']}
      defaultSelected="src/components/tree.tsx"
      renderNode={(payload) => (
        <>
          {payload.hasChildren ? payload.expanded ? <FolderOpen /> : <Folder /> : <File />}
          {payload.node.label}
        </>
      )}
    />
  );
}
