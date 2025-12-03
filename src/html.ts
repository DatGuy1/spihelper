export const spiHelperTopViewHTML = `
<div id="spiHelper_topViewDiv">
  <h3>Handling SPI case</h3>
  <select id="spiHelper_sectionSelect"></select>
  <h4 id="spiHelper_warning" class="spihelper-errortext" hidden></h4>
  <ul>
    <li id="spiHelper_actionLine"  class="spiHelper_singleCaseOnly spiHelper_notOnArchive">
      <input type="checkbox" name="spiHelper_Case_Action" id="spiHelper_Case_Action" />
      <label for="spiHelper_Case_Action">Change case status</label>
    </li>
    <li id="spiHelper_spiMgmtLine"  class="spiHelper_allCasesOnly spiHelper_notOnArchive">
      <input type="checkbox" id="spiHelper_SpiMgmt" />
      <label for="spiHelper_SpiMgmt">Change SPI options</label>
    </li>
    <li id="spiHelper_blockLine" class="spiHelper_adminClerkClass">
      <input type="checkbox" name="spiHelper_BlockTag" id="spiHelper_BlockTag" />
      <label for="spiHelper_BlockTag">Block/tag socks</label>
    </li>
    <li id="spiHelper_userInfoLine" class="spiHelper_singleCaseOnly">
      <input type="checkbox" name="spiHelper_userInfo" id="spiHelper_userInfo" />
      <label for="spiHelper_userInfo">Sock links</label>
    </li>
    <li id="spiHelper_commentLine" class="spiHelper_singleCaseOnly spiHelper_notOnArchive">
      <input type="checkbox" name="spiHelper_Comment" id="spiHelper_Comment" />
      <label for="spiHelper_Comment">Note/comment</label>
    </li>
    <li id="spiHelper_closeLine" class="spiHelper_adminClerkClass spiHelper_singleCaseOnly spiHelper_notOnArchive">
      <input type="checkbox" name="spiHelper_Close" id="spiHelper_Close" />
      <label for="spiHelper_Close">Close case</label>
    </li>
    <li id="spiHelper_moveLine" class="spiHelper_clerkClass spiHelper_notOnArchive">
      <input type="checkbox" name="spiHelper_Move" id="spiHelper_Move" />
      <label for="spiHelper_Move" id="spiHelper_moveLabel">Move/merge full case (Clerk only)</label>
    </li>
    <li id="spiHelper_archiveLine" class="spiHelper_clerkClass spiHelper_notOnArchive">
      <input type="checkbox" name="spiHelper_Archive" id="spiHelper_Archive"/>
      <label for="spiHelper_Archive">Archive case (Clerk only)</label>
    </li>
  </ul>
  <input type="button" id="spiHelper_GenerateForm" name="spiHelper_GenerateForm" value="Continue" />
</div>
`;

export const spiHelperActionViewHTML = `
<div id="spiHelper_actionViewDiv">
  <small><a id="spiHelper_backLink">Back to top menu</a></small>
  <br>
  <h3>Handling SPI case</h3>
  <div id="spiHelper_actionView">
    <h4>Changing case status</h4>
    <label for="spiHelper_CaseAction">New status:</label>
    <select id="spiHelper_CaseAction"></select>
  </div>
  <div id="spiHelper_spiMgmtView">
    <h4>Changing SPI settings</h4>
    <ul>
      <li>
        <input type="checkbox" id="spiHelper_spiMgmt_crosswiki" />
        <label for="spiHelper_spiMgmt_crosswiki">Case is crosswiki</label>
      </li>
      <li>
        <input type="checkbox" id="spiHelper_spiMgmt_deny" />
        <label for="spiHelper_spiMgmt_deny">Socks should not be tagged per DENY</label>
      </li>
      <li>
        <input type="checkbox" id="spiHelper_spiMgmt_notalk" />
        <label for="spiHelper_spiMgmt_notalk">Socks should have talk page and email access revoked due to past abuse</label>
      </li>
    </ul>
  </div>
  <div id="spiHelper_sockLinksView">
    <h4 id="spiHelper_sockLinksHeader">Useful links for socks</h4>
    <table id="spiHelper_userInfoTable" style="border-collapse:collapse;">
      <tr>
        <th>Username</th>
        <th><span title="Editor interaction analyser" class="rt-commentedText spihelper-hovertext">Interaction analyser</span></th>
        <th><span title="Interaction timeline" class="rt-commentedText spihelper-hovertext">Interaction timeline</span></th>
        <th><span title="Timecard comparison - SPI tools" class="rt-commentedText spihelper-hovertext">Timecard</span></th>
        <th class="spiHelper_adminClass"><span title="Consolidated timeline (login needed) - SPI tools" class="rt-commentedText spihelper-hovertext">Consolidated timeline</span></th>
        <th class="spiHelper_adminClass"><span title="Pages - SPI tools (login needed)" class="rt-commentedText spihelper-hovertext">Pages</span></th>
        <th class="spiHelper_cuClass"><span title="CheckUser wiki search" class="rt-commentedText spihelper-hovertext">CU wiki</span></th>
      </tr>
      <tr style="border-bottom:2px solid black">
        <td style="text-align:center;">(All users)</td>
        <td style="text-align:center;"><input type="checkbox" id="spiHelper_link_editorInteractionAnalyser"/></td>
        <td style="text-align:center;"><input type="checkbox" id="spiHelper_link_interactionTimeline"/></td>
        <td style="text-align:center;"><input type="checkbox" id="spiHelper_link_timecardSPITools"/></td>
        <td style="text-align:center;" class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_link_consolidatedTimelineSPITools"/></td>
        <td style="text-align:center;" class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_link_pagesSPITools"/></td>
        <td style="text-align:center;" class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_link_checkUserWikiSearch"/></td>
      </tr>
    </table>
    <span><input type="button" id="AddSockBlock" value="Add Row"/></span>
  </div>
  <div id="spiHelper_blockTagView">
    <h4 id="spiHelper_blockTagHeader">Blocking and tagging socks</h4>
    <ul>
      <li class="spiHelper_adminClass">
        <input type="checkbox" name="spiHelper_noblock" id="spiHelper_noblock" />
        <label for="spiHelper_noblock">Do not make any blocks (this overrides the individual "Blk" boxes below).</label>
      </li>
      <li class="spiHelper_adminClass">
        <input type="checkbox" name="spiHelper_override" id="spiHelper_override" />
        <label for="spiHelper_override">Override any existing blocks.</label>
      </li>
      <li class="spiHelper_clerkClass">
        <input type="checkbox" checked="checked" name="spiHelper_tagAccountsWithoutLocalAccount" id="spiHelper_tagAccountsWithoutLocalAccount" />
        <label for="spiHelper_tagAccountsWithoutLocalAccount">Tag accounts without an attached local account.</label>
      </li>
      <li class="spiHelper_cuClass">
        <input type="checkbox" name="spiHelper_cublock" id="spiHelper_cublock" />
        <label for="spiHelper_cublock">Mark blocks as Checkuser blocks.</label>
      </li>
      <li class="spiHelper_cuClass">
        <input type="checkbox" name="spiHelper_cublockonly" id="spiHelper_cublockonly" />
        <label for="spiHelper_cublockonly">
          Suppress the usual block summary and only use {{checkuserblock-account}} and {{checkuserblock}} (no effect if "mark blocks as CU blocks" is not checked).
        </label>
      </li>
      <li class="spiHelper_adminClass">
        <input type="checkbox" checked="checked" name="spiHelper_blocknoticemaster" id="spiHelper_blocknoticemaster" />
        <label for="spiHelper_blocknoticemaster">Add talk page notice when (re)blocking the sockmaster.</label>
      </li>
      <li class="spiHelper_adminClass">
        <input type="checkbox" checked="checked" name="spiHelper_blocknoticesocks" id="spiHelper_blocknoticesocks" />
        <label for="spiHelper_blocknoticesocks">Add talk page notice when blocking socks.</label>
      </li>
      <li class="spiHelper_adminClass">
        <input type="checkbox" name="spiHelper_blanktalk" id="spiHelper_blanktalk" />
        <label for="spiHelper_blanktalk">Blank the talk page when adding talk notices.</label>
      </li>
      <li>
        <input type="checkbox" name="spiHelper_hidelocknames" id="spiHelper_hidelocknames" />
        <label for="spiHelper_hidelocknames">Hide usernames when requesting global locks.</label>
      </li>
    </ul>
    <table id="spiHelper_blockTable" style="border-collapse:collapse;">
      <tr>
        <th>Username</th>
        <th class="spiHelper_adminClass"><span title="Block user" class="rt-commentedText spihelper-hovertext">Blk?</span></th>
        <th class="spiHelper_adminClass"><span title="Block duration" class="rt-commentedText spihelper-hovertext">Duration</span></th>
        <th class="spiHelper_adminClass"><span title="Account creation blocked" class="rt-commentedText spihelper-hovertext">ACB</span></th>
        <th class="spiHelper_adminClass"><span title="Autoblock (for logged-in users)/Anonymous-only (for IPs)" class="rt-commentedText spihelper-hovertext">AB/AO</span></th>
        <th class="spiHelper_adminClass"><span title="Disable talk page access" class="rt-commentedText spihelper-hovertext">NTP</span></th>
        <th class="spiHelper_adminClass"><span title="Disable email" class="rt-commentedText spihelper-hovertext">NEM</span></th>
        <th>Tag</th>
        <th><span title="Tag the user with a suspected alternate master" class="rt-commentedText spihelper-hovertext">Alt Master</span></th>
        <th><span title="Request a global lock at Meta:SRG" class="rt-commentedText spihelper-hovertext">Req Lock?</span></th>
      </tr>
      <tr style="border-bottom:2px solid black">
        <td style="text-align:center;">(All users)</td>
        <td class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_block_doblock"/></td>
        <td class="spiHelper_adminClass"></td>
        <td class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_block_acb" checked="checked"/></td>
        <td class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_block_ab" checked="checked"/></td>
        <td class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_block_tp"/></td>
        <td class="spiHelper_adminClass"><input type="checkbox" id="spiHelper_block_email"/></td>
        <td><select id="spiHelper_block_tag"></select></td>
        <td><select id="spiHelper_block_tag_altmaster"></select></td>
  
        <td><input type="checkbox" name="spiHelper_block_lock_all" id="spiHelper_block_lock"/></td>
      </tr>
    </table>
    <span><input type="button" id="AddSockLink" value="Add Row"/></span>
  </div>
  <div id="spiHelper_closeView">
    <h4>Marking case as closed</h4>
    <input type="checkbox" checked="checked" id="spiHelper_CloseCase" />
    <label for="spiHelper_CloseCase">Close this SPI case</label>
  </div>
  <div id="spiHelper_moveView">
    <h4 id="spiHelper_moveHeader">Move section</h4>
    <label for="spiHelper_moveTarget">New sockmaster username: </label>
    <input type="text" name="spiHelper_moveTarget" id="spiHelper_moveTarget" />
  </div>
  <div id="spiHelper_archiveView">
    <h4>Archiving case</h4>
    <input type="checkbox" checked="checked" name="spiHelper_ArchiveCase" id="spiHelper_ArchiveCase" />
    <label for="spiHelper_ArchiveCase">Archive this SPI case</label>
  </div>
  <div id="spiHelper_commentView">
    <h4>Comments</h4>
    <span>
      <select id="spiHelper_noteSelect"></select>
      <select class="spiHelper_adminClerkClass" id="spiHelper_adminSelect"></select>
      <select class="spiHelper_cuClass" id="spiHelper_cuSelect"></select>
    </span>
    <div>
      <label for="spiHelper_CommentText">Comment:</label>
      <textarea rows="3" cols="80" id="spiHelper_CommentText">*</textarea>
      <div><a id="spiHelper_previewLink">Preview</a></div>
    </div>
    <div class="spihelper-previewbox" id="spiHelper_previewBox" hidden></div>
  </div>
  <br>
  <input type="button" id="spiHelper_performActions" value="Done" />
</div>
`;
