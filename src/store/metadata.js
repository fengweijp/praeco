import Vue from 'vue';
import axios from 'axios';
import { buildMappingFields, buildMappingTypes } from '@/lib/elasticSearchMetadata.js';
import networkError from '../lib/networkError.js';

export default {
  namespaced: true,

  state: {
    indices: [],
    mappings: {
      // 'ms-*': {
      //   types: [],
      //   fields: []
      // }
    }
  },

  getters: {
    suggestedIndices(state) {
      let indices = {};

      state.indices.forEach(item => {
        let parts = item.split(/-/);
        if (parts[0].startsWith('.')) return;
        if (parts.length > 1) {
          indices[`${parts[0]}-*`] = true;
        } else {
          indices[parts[0]] = true;
        }
      });

      return Object.keys(indices);
    }
  },

  mutations: {
    FETCHED_INDICES(state, payload) {
      state.indices = payload;
    },

    FETCHED_MAPPINGS(state, { mappings, index }) {
      if (!state.mappings[index]) {
        Vue.set(state.mappings, index, {});
      }

      Vue.set(state.mappings[index], 'types', buildMappingTypes(mappings));
      Vue.set(state.mappings[index], 'fields', buildMappingFields(mappings));
    }
  },

  actions: {
    async fetchIndices({ commit, state }) {
      if (state.indices.length) {
        return true;
      }

      try {
        let res = await axios.get('/indices');
        commit('FETCHED_INDICES', res.data);
        return true;
      } catch (error) {
        networkError(error);
      }
    },

    async fetchMappings({ commit, state }, index) {
      if (state.mappings[index]) {
        return true;
      }

      try {
        let res = await axios.get(`/mapping/${index}`);
        commit('FETCHED_MAPPINGS', { mappings: res.data, index });
        return true;
      } catch (error) {
        networkError(error);
      }
    }
  }
};