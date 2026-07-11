import { describe, expect, test } from 'bun:test';
import { addOldMasterToSockList } from '../../src/actions';

const NOTE = '({{clerknote}} original case name)';
const section = '====Suspected sockpuppets====\n';

describe('addOldMasterToSockList', () => {
  describe('no sock list present', () => {
    test('adds checkuser bullet and normalises section header', () => {
      const page = `${section}* {{checkuser|1=ExistingUser}}\n`;
      const result = addOldMasterToSockList(page, 'OldMaster');
      expect(result).toBe(
        `${section}* {{checkuser|1=OldMaster}} ${NOTE}\n* {{checkuser|1=ExistingUser}}\n`,
      );
    });

    test('handles extra blank lines after section header', () => {
      const page = `====Suspected sockpuppets====\n\n\n* {{checkuser|1=Sock}}\n`;
      const result = addOldMasterToSockList(page, 'OldMaster');
      expect(result).toContain('* {{checkuser|1=OldMaster}} ' + NOTE);
      expect(result).not.toMatch(/====\n{2,}/);
    });
  });

  describe('sock list present', () => {
    describe('user not listed', () => {
      test('inline: inserts new entry before }}', () => {
        const page = `${section}{{sock list|1=SockA|2=SockB}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|1=SockA|2=SockB|3=OldMaster|note3=${NOTE}}}`,
        );
      });

      test('inline: inserts new entry before first non-entry named param', () => {
        const page = `${section}{{sock list|1=SockA|2=SockB|tools_link=yes}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|1=SockA|2=SockB|3=OldMaster|note3=${NOTE}|tools_link=yes}}`,
        );
      });

      test('multiline: inserts new entry with newlines before }}', () => {
        const page = `${section}{{sock list\n|1=SockA\n|2=SockB\n}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list\n|1=SockA\n|2=SockB\n|3=OldMaster|note3=${NOTE}\n}}`,
        );
      });

      test('multiline: inserts new entry before non-entry named param', () => {
        const page = `${section}{{sock list\n|1=SockA\n|2=SockB\n|tools_link=yes\n}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list\n|1=SockA\n|2=SockB\n|3=OldMaster|note3=${NOTE}\n|tools_link=yes\n}}`,
        );
      });

      test('empty sock list: inserts as first entry', () => {
        const page = `${section}{{sock list}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|1=OldMaster|note1=${NOTE}}}`,
        );
      });

      test('uses positional count when template uses positional params', () => {
        const page = `${section}{{sock list|SockA|SockB}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|SockA|SockB|3=OldMaster|note3=${NOTE}}}`,
        );
      });
    });

    describe('user already listed', () => {
      test('named param: adds note after the matching entry', () => {
        const page = `${section}{{sock list|1=SockA|2=OldMaster|tools_link=yes}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|1=SockA|2=OldMaster|note2=${NOTE}|tools_link=yes}}`,
        );
      });

      test('named param, multiline: adds note on same line as entry', () => {
        const page = `${section}{{sock list\n|1=SockA\n|2=OldMaster\n|tools_link=yes\n}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list\n|1=SockA\n|2=OldMaster|note2=${NOTE}\n|tools_link=yes\n}}`,
        );
      });

      test('positional param: adds note at the correct positional index', () => {
        const page = `${section}{{sock list|SockA|OldMaster|SockB}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|SockA|OldMaster|note2=${NOTE}|SockB}}`,
        );
      });

      test('note already present: returns page unchanged', () => {
        const page = `${section}{{sock list|1=SockA|2=OldMaster|note2=${NOTE}|tools_link=yes}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(page);
      });

      test('case-insensitive match on username', () => {
        const page = `${section}{{sock list|1=SockA|2=oldmaster}}`;
        const result = addOldMasterToSockList(page, 'OldMaster');
        expect(result).toBe(
          `${section}{{sock list|1=SockA|2=oldmaster|note2=${NOTE}}}`,
        );
      });
    });
  });
});
