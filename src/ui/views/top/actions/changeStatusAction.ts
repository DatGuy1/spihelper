import { defineComponent } from 'vue';
import { spiHelperCaseClosedRegex } from '../../../../constants/regex.ts';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from '../../../../role.ts';
import type { MenuGroupData, MenuItemData, MenuItemValue } from '@wikimedia/codex';
import { isMenuGroupData } from '../../../utils.ts';

export const ChangeStatusActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    status: { type: String, required: true },
  },
  data() {
    return {
      localStatus: this.status,
    };
  },
  emits: ['update:enabled', 'update:status'],
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `,
  computed: {
    selected: {
      get(): MenuItemValue | null {
        if (this.localStatus === 'nochange') {
          return 'nochange';
        }
        const itemData = this.caseStatusItems
          .flatMap(item => isMenuGroupData(item) ? item.items : [item])
          .find(item => item.value === this.status);

        return itemData?.value ?? null;
      },
      set(value: MenuItemValue | null) {
        if (value === null) {
          return;
        }
        this.localStatus = String(value);
        if (value !== 'nochange') {
          this.$emit('update:status', String(value));
        }
      },
    },
    caseStatusItems(): (MenuItemData | MenuGroupData)[] {
      const mainItems: MenuItemData[] = [];
      const clerkItems: MenuItemData[] = [];
      const cuItems: MenuItemData[] = [];
      const deferItems: MenuItemData[] = [];

      const isCheckuser = spiHelperIsCheckuser();
      const isClerk = spiHelperIsClerk();

      const cuRequested = /^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.status);
      const cuEndorsed = /^endorsed?$/i.test(this.status);
      const cuCompleted = /^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.status);

      // We'd prefer for 'change status' to be disabled, but also add 'no change' for confused users
      mainItems.push({ label: 'No change', value: 'nochange' });
      if (spiHelperCaseClosedRegex.test(this.status)) {
        mainItems.push({ label: 'Reopen', value: 'reopen' });
      }
      else {
        mainItems.push({ label: 'Open', value: 'open' });
      }
      mainItems.push({ label: 'Close', value: 'closed' });
      cuItems.push({ label: 'Request CheckUser', value: 'CUrequest' });
      if (isCheckuser) {
        cuItems.push({ label: 'Check in progress', value: 'inprogress' });
      }
      if (isClerk) {
        // Not a real status by the way, we change it ourselves later
        cuItems.push({ label: 'Request and self-endorse', value: 'selfendorse' });
        clerkItems.push({ label: 'Request more information', value: 'moreinfo' });
        if (isCheckuser) {
          cuItems.push({ label: 'Mark as checked', value: 'checked' });
        }
        if (cuCompleted) {
          cuItems.push({ label: 'Relist for another check', value: 'relist' });
        }
      }
      if (isClerk) {
        // CU already requested
        if (cuRequested) {
          // Statuses only available if CU has been requested, only clerks + CUs should use these
          // Switch the decline option depending on whether the user is a checkuser
          if (isCheckuser) {
            cuItems.push({ label: 'Endorse CheckUser', value: 'cuendorse' });
            cuItems.push({ label: 'Decline CheckUser', value: 'cudecline' });
          }
          else {
            cuItems.push({ label: 'Endorse for CheckUser attention', value: 'endorse' });
            cuItems.push({ label: 'Decline CheckUser', value: 'decline' });
          }
          clerkItems.push({ label: 'Request more information for CheckUser', value: 'cumoreinfo' });
        }
        else if (cuEndorsed) {
          if (spiHelperIsCheckuser()) {
            cuItems.push({ label: 'Decline CheckUser', value: 'cudecline' });
          }
          else {
            cuItems.push({ label: 'Decline CheckUser', value: 'decline' });
          }
          clerkItems.push({ label: 'Request more information for CheckUser', value: 'cumoreinfo' });
        }
      }
      if (isCheckuser) {
        clerkItems.push({ label: 'Place case on CU hold', value: 'cuhold' });
      }
      else { // I guess it's okay for anyone to have this option
        clerkItems.push({ label: 'Place case on hold', value: 'hold' });
      }
      deferItems.push({ label: 'Request clerk action', value: 'clerk' });
      if (spiHelperIsAdmin() || isClerk) {
        deferItems.push({ label: 'Request admin action', value: 'admin' });
      }
      const groups: MenuGroupData[] = [
        clerkItems.length ? { label: 'Clerking', items: clerkItems } : null,
        cuItems.length ? { label: 'CheckUser', items: cuItems } : null,
        deferItems.length ? { label: 'Deferral', items: deferItems } : null,
      ].filter(g => g !== null);
      return [...mainItems, ...groups];
    },
  },
  methods: {

  },
});
