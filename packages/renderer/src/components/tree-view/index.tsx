import type { PropType} from 'vue';
import { defineComponent, ref } from 'vue';
import VueFeather from 'vue-feather';
import style from './style.module.css';

export interface TreeItem {
  id: string;
  name: string;
  type: 'directory' | 'file';
  children?: TreeItem[];
}

export interface TreeViewProps {
  data: TreeItem[];
  activeItemId?: string;
  whenClick?: (item: TreeItem) => void;
  whenContextMenu?: (event: MouseEvent, item: TreeItem) => void;
  whenMove?: (targetItem: TreeItem, destinationItem: TreeItem) => void;
}

export interface TreeViewPublicInstance {
  collapse: () => void;
}

export const TreeView = defineComponent({
  name: 'TreeView',
  props: {
    data: {
      type: Array as PropType<TreeViewProps['data']>,
      default: () => [],
    },
    activeItemId: {
      type: String as PropType<TreeViewProps['activeItemId']>,
      default: undefined,
    },
    whenClick: {
      type: Function as PropType<NonNullable<TreeViewProps['whenClick']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    whenContextMenu: {
      type: Function as PropType<NonNullable<TreeViewProps['whenContextMenu']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    whenMove: {
      type: Function as PropType<NonNullable<TreeViewProps['whenMove']>>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
  },
  setup(props, { expose }) {
    const expandedIds = ref<string[]>([]);
    const draggableItem = ref<TreeItem>();

    function handleItemClick(treeItem: TreeItem) {
      props.whenClick(treeItem);
    }

    function handleFolderClick(treeItem: TreeItem) {
      if (expandedIds.value.includes(treeItem.id)) {
        expandedIds.value = expandedIds.value.filter(item => item !== treeItem.id);
      } else {
        expandedIds.value.push(treeItem.id);
      }
    }

    function handleDragStart(event: DragEvent, item: TreeItem) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.setData('itemId', item.id);
        draggableItem.value = item;
      }
    }

    function handleDrop(evt: DragEvent, item: TreeItem) {
      (evt.target as HTMLDivElement).classList.remove(style.dragOver);
      if (evt.dataTransfer && draggableItem.value) {
        props.whenMove(draggableItem.value, item);
      }
      draggableItem.value = undefined;
    }

    function handleDragOver(evt: DragEvent) {
      evt.preventDefault();
      (evt.target as HTMLDivElement).classList.add(style.dragOver);
    }

    function handleDragLeave(evt: DragEvent) {
      evt.preventDefault();
      (evt.target as HTMLDivElement).classList.remove(style.dragOver);
    }

    function renderItem(item: TreeItem, level = 1) {
      return (
        <li>
          <div
            class={[
              style.label,
              {
                [style.active]: item.id === props.activeItemId,
              },
            ]}
            draggable
            onDrop={(event: DragEvent) => handleDrop(event, item)}
            onDragover={handleDragOver}
            onDragleave={handleDragLeave}
            onDragstart={(event: DragEvent) => handleDragStart(event, item)}
            onClick={() => item.type === 'directory' ? handleFolderClick(item) : handleItemClick(item)}
            onContextmenu={(e) => props.whenContextMenu(e, item)}
          >
            {item.type === 'directory'
              ? <VueFeather class={style.chevron} type={expandedIds.value.includes(item.id) ? 'chevron-down' : 'chevron-right'} />
              : <VueFeather class={style.chevron} type="file-text" />}
            {item.name}
          </div>
          {expandedIds.value.includes(item.id) && item.children && item.children?.length > 0 && (
            <ul style={{ paddingLeft: '20px' }}>
              {item.children.map((item) => renderItem(item, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    function collapse() {
      expandedIds.value = [];
    }

    const instance: TreeViewPublicInstance = {
      collapse,
    };
    expose(instance);

    return () => (
      <div class={style.wrapper}>
        <ul>
          {props.data.map((item) => renderItem(item, 1))}
        </ul>
      </div>
    );
  },
});
