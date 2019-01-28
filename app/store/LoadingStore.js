import { EventEmitter } from 'events';

import {
  DISABLE_LOADING,
  ENABLE_LOADING
} from '../constants';
import dispatcher from '../dispatcher';

class LoadingStore extends EventEmitter {
  constructor() {
    super();
    this.state = {
      loading: false,
    };
  }

  disableLoading = () => {
    this.state.loading = false;
    this.emit('change');
  }

  enableLoading = () => {
    this.state.loading = true;
    this.emit('change');
  }

  getLoadingState = () => (this.state.loading);

  handleActions = (action) => {
    switch (action.type) {
      case DISABLE_LOADING:
        this.disableLoading();
        break;
      case ENABLE_LOADING:
        this.enableLoading();
        break;
    }
  }
}

const loadingStore = new LoadingStore;
dispatcher.register(loadingStore.handleActions.bind(loadingStore));
export default loadingStore;


