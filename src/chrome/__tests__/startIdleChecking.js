/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import { mockChrome } from '../__mocks__/chrome';
import startIdleChecking from '../startIdleChecking';
import pluginApp from '../../reducers';
import { createStore } from 'redux';
import { updateWorkerState } from '../../actions';
import { workerIdle } from '../notifications';

describe('startIdleChecking', function() {
  ['idle', 'locked'].forEach(state => {
    it(`changes the worker state to inactive after chrome is ${state}`, function() {
      const chrome = mockChrome();
      const store = createStore(pluginApp);
      store.dispatch(updateWorkerState('ready'));

      startIdleChecking(store, chrome);

      chrome.stateChanged('active');

      expect(store.getState().worker.get('state')).to.equal('ready');

      chrome.stateChanged(state);

      expect(store.getState().worker.get('state')).to.equal('inactive');
    });
  });

  it('gives the worker a notification and logs them back in if they click it', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    expect(chrome.getCurrentNotifications()).to.have.property(workerIdle);

    chrome.clickNotification(workerIdle);

    expect(store.getState().worker.get('state')).to.equal('ready');
  });

  it('clears the notification when the worker goes active', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    store.dispatch(updateWorkerState('ready'));

    startIdleChecking(store, chrome);

    chrome.stateChanged('idle');

    store.dispatch(updateWorkerState('ready'));

    expect(chrome.getCurrentNotifications()).to.not.have.property(workerIdle);
  });
});