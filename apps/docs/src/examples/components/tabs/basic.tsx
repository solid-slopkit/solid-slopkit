import { Image, MessageCircle, Settings } from '@lucide/solid';
import { Badge, Tabs, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Tabs defaultValue="gallery">
      <Tabs.List aria-label="Project">
        <Tabs.Tab value="gallery" leftSection={<Image />}>
          Gallery
        </Tabs.Tab>
        <Tabs.Tab value="messages" leftSection={<MessageCircle />} rightSection={<Badge size="xs">3</Badge>}>
          Messages
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection={<Settings />} disabled>
          Settings
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery" style={{ 'padding-top': '1rem' }}>
        <Text>Photos and videos from the project.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="messages" style={{ 'padding-top': '1rem' }}>
        <Text>Three unread messages.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="settings" style={{ 'padding-top': '1rem' }}>
        <Text>Settings are only for owners.</Text>
      </Tabs.Panel>
    </Tabs>
  );
}
