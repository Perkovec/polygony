import type { Plugin, App, AppContext, Component } from 'vue';
import { h, onUnmounted, render } from 'vue';
import { ConfirmModal } from './confirm-modal';
import type { ComponentProps } from 'types/utils';
import { PromptModal } from './prompt-modal';

export type SFCWithInstall<T> = T & Plugin;

export type ShowMethod = typeof showModal & { _context: AppContext | null };

export interface ModalAPI {
  close: () => void;
}

function showModal<T extends Component = Component>(component: Component, opts: Omit<ComponentProps<T>, 'modalApi'>): ModalAPI {
  const container = document.createElement('div');

  function close() {
    render(null, container);
    document.body.removeChild(container);
  }

  const modalApi: ModalAPI = {
    close,
  };

  const vnode = h(component, { ...opts, modalApi });

  vnode.appContext = (showModal as ShowMethod)._context;
  render(vnode, container);

  document.body.appendChild(container);

  onUnmounted(() => close);

  return modalApi;
}

(showModal as ShowMethod)._context = null;

export const ModalInstaller = showModal as SFCWithInstall<ShowMethod>;

ModalInstaller.install = (app: App) => {
  ModalInstaller._context = app._context;
};

export const showConfirmModal = (opts: Omit<ComponentProps<typeof ConfirmModal>, 'modalApi'>) => showModal(ConfirmModal, opts);

export const showPromptModal = (opts: Omit<ComponentProps<typeof PromptModal>, 'modalApi'>) => showModal(PromptModal, opts);
