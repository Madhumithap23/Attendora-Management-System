/* Role permissions and approval workflow for the college attendance portal. */
(function(){
  const $=s=>document.querySelector(s);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const role=()=>localStorage.getItem('cloud-role')||'';
  const identity=()=>String(localStorage.getItem('cloud-user-id')||$('#login-email')?.value||'').trim().toLowerCase();
  const studentFallback=[
    {id:'STU-2401',name:'Aarav Mehta',email:'aarav.mehta@cloud.edu',department:'Computer Science',course:'B.Tech',semester:'VI',section:'A',attendance:94},
    {id:'STU-2402',name:'Diya Sharma',email:'diya.sharma@cloud.edu',department:'Computer Science',course:'B.Tech',semester:'VI',section:'A',attendance:91},
    {id:'STU-2403',name:'Kabir Kapoor',email:'kabir.kapoor@cloud.edu',department:'Information Tech',course:'B.Tech',semester:'VI',section:'B',attendance:76},
    {id:'STU-2404',name:'Meera Iyer',email:'meera.iyer@cloud.edu',department:'Computer Science',course:'B.Tech',semester:'VI',section:'A',attendance:88},
    {id:'STU-2405',name:'Rohan Das',email:'rohan.das@cloud.edu',department:'Electronics',course:'B.Tech',semester:'IV',section:'C',attendance:82},
    {id:'STU-2406',name:'Sana Khan',email:'sana.khan@cloud.edu',department:'Information Tech',course:'B.Tech',semester:'VI',section:'B',attendance:96},
    {id:'STU-2407',name:'Arjun Patel',email:'arjun.patel@cloud.edu',department:'Computer Science',course:'B.Tech',semester:'VI',section:'A',attendance:69}
  ];
  const facultyFallback=[
    {id:'FAC-081',name:'Dr. Riya Menon',email:'riya.menon@cloud.edu',department:'Computer Science',subject:'Data Structures',phone:'+91 98765 34012'},
    {id:'FAC-082',name:'Prof. Arvind Rao',email:'arvind.rao@cloud.edu',department:'Computer Science',subject:'DBMS',phone:'+91 98220 76145'},
    {id:'FAC-083',name:'Dr. Neha Gupta',email:'neha.gupta@cloud.edu',department:'Information Tech',subject:'Operating Systems',phone:'+91 98810 26240'},
    {id:'FAC-084',name:'Prof. Sameer Shah',email:'sameer.shah@cloud.edu',department:'Electronics',subject:'Computer Networks',phone:'+91 97111 87032'}
  ];
  const classCatalog=[
    {id:'CS-601',name:'Data Structures',section:'VI-A',department:'Computer Science'},
    {id:'CS-602',name:'Database Management',section:'VI-A',department:'Computer Science'},
    {id:'CS-603',name:'Software Engineering',section:'VI-A',department:'Computer Science'},
    {id:'IT-604',name:'Operating Systems',section:'VI-B',department:'Information Tech'},
    {id:'EC-501',name:'Computer Networks',section:'IV-C',department:'Electronics'}
  ];
  const permissions={
    Admin:['dashboard','students','faculty','attendance','reports','requests','timetable','messages','settings','system-status'],
    Faculty:['dashboard','attendance','reports','messages','timetable'],
    Student:['dashboard','attendance']
  };
  const getStudents=()=>read('cloud-students',studentFallback);
  const getFaculty=()=>read('cloud-faculty',facultyFallback);
  const getAttendance=()=>read('cloud-attendance',Object.fromEntries(getStudents().map(s=>[s.id,'Present'])));
  const getRequests=()=>read('cloud-change-requests',[]);
  const saveAll=(students,faculty,attendance,requests)=>{
    if(students)write('cloud-students',students);
    if(faculty)write('cloud-faculty',faculty);
    if(attendance)write('cloud-attendance',attendance);
    if(requests)write('cloud-change-requests',requests);
  };
  const escLocal=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const findStudent=()=>{const list=getStudents();const key=identity();return list.find(s=>String(s.id).toLowerCase()===key||String(s.email).toLowerCase()===key)||list[0]};
  const findFaculty=()=>{const list=getFaculty();const key=identity();return list.find(f=>String(f.id).toLowerCase()===key||String(f.email).toLowerCase()===key)||list[0]};
  const classesForFaculty=fac=>{
    const assigned={
      'FAC-081':['CS-601','CS-603'],
      'FAC-082':['CS-602','CS-603'],
      'FAC-083':['IT-604','CS-602'],
      'FAC-084':['EC-501','CS-601']
    };
    const ids=Array.isArray(fac?.assignedClasses)&&fac.assignedClasses.length?fac.assignedClasses:(assigned[fac?.id]||classCatalog.filter(c=>c.department===fac?.department).map(c=>c.id));
    return classCatalog.filter(c=>ids.includes(c.id));
  };
  const currentRoute=()=>location.hash.replace(/^#/,'').split('?')[0]||'dashboard';
  const allowedRoute=r=>permissions[role()]?.includes(r);
  const showToast=(title,body)=>{if(typeof toast==='function')toast(title,body)};
  const saveIdentity=()=>{const input=$('#login-email');if(input?.value)localStorage.setItem('cloud-user-id',input.value.trim())};
  const shellProfile=()=>{
    const r=role();
    const person=r==='Student'?findStudent():r==='Faculty'?findFaculty():{name:'Admin Manager',id:'ADMIN',department:'System administrator'};
    const card=$('.profile-card');
    if(card)card.innerHTML=`<div class="avatar">${escLocal((person.name||'Admin').split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><b>${escLocal(person.name||'Admin Manager')}</b><small>${escLocal(r==='Admin'?'Administrator':r)}</small></div><button id="logout-btn" title="Sign out">↪</button>`;
    $('#logout-btn')?.addEventListener('click',()=>{localStorage.removeItem('cloud-role');localStorage.removeItem('cloud-user-id');location.hash='';location.reload()});
  };
  const shellNav=()=>{
    const r=role();
    const icons={dashboard:'▦',students:'♧',faculty:'♙',attendance:'◫',reports:'▤',requests:'✓',timetable:'▦',messages:'▱',settings:'⚙','system-status':'◉'};
    const labels={dashboard:'Dashboard',students:'Students',faculty:'Faculty',attendance:'Attendance',reports:'Reports',requests:'Approval requests',timetable:'Timetable',messages:'Messages',settings:'Settings','system-status':'System status'};
    const nav=$('#sidebar-nav');if(!nav)return;
    const reqCount=getRequests().filter(x=>x.status==='Pending').length;
    nav.innerHTML=(permissions[r]||[]).map(item=>`<a href="#${item}" data-route="${item}"><span class="nav-icon">${icons[item]||'•'}</span>${labels[item]||item}${item==='requests'&&reqCount?`<span class="nav-badge">${reqCount}</span>`:''}</a>`).join('');
    nav.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===currentRoute()));
    shellProfile();
  };
  const guard=()=>{
    const r=role();
    if(!r)return false;
    const route=currentRoute();
    if(!allowedRoute(route)){if(route!=='dashboard')location.hash='dashboard';return false}
    return true;
  };
  const profileBlock=(person,type)=>`<section class="card role-profile"><div class="role-profile-head"><div class="person">${typeof personAvatar==='function'?personAvatar(person.name):`<span class="person-avatar">${escLocal(person.name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</span>`}<span><b>${escLocal(person.name)}</b><small>${escLocal(type)} · ${escLocal(person.id)}</small></span></div><span class="read-only-label">View only</span></div><dl class="profile-details"><div><dt>Email</dt><dd>${escLocal(person.email||'Not set')}</dd></div><div><dt>Department</dt><dd>${escLocal(person.department||'Not set')}</dd></div><div><dt>Course / subject</dt><dd>${escLocal(person.course||person.subject||'Not set')}</dd></div><div><dt>Section / phone</dt><dd>${escLocal(person.section||person.phone||'Not set')}</dd></div></dl></section>`;
  function renderStudentOnly(){
    const s=findStudent();
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Student dashboard</span><h1>My profile</h1><p>Your personal information is shown here. Records can only be changed by an administrator.</p></div>${profileBlock(s,'Student')}<section class="card role-note"><b>Read-only account</b><p>You can view your details and attendance. You cannot edit records or view other students.</p><a class="secondary-btn" href="#attendance">View my attendance</a></section>`;
  }
  function renderStudentOnlyAttendance(){
    const s=findStudent();const attendance=getAttendance();const status=attendance[s.id]||'Present';
    const subjects=[['CS-601','Data Structures','Dr. Riya Menon'],['CS-602','Database Management','Prof. Arvind Rao'],['IT-604','Operating Systems','Dr. Neha Gupta'],['EC-501','Computer Networks','Prof. Sameer Shah']];
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Student attendance</span><h1>My attendance</h1><p>Only your own attendance records are shown. This page is read-only.</p></div><section class="attendance-summary"><div class="card summary-card"><span class="metric-glyph present">●</span><div><label>Current status</label><strong>${escLocal(status)}</strong></div></div><div class="card summary-card"><span class="metric-glyph">%</span><div><label>Overall attendance</label><strong>${escLocal(s.attendance)}%</strong></div></div><div class="card summary-card"><span class="metric-glyph late">i</span><div><label>Account access</label><strong>View only</strong></div></div></section><section class="card table-card"><div class="card-title">Class attendance</div><div class="card-subtitle">Your attendance by subject</div><div class="table-wrap" style="margin-top:12px"><table class="data-table"><thead><tr><th>Class</th><th>Faculty</th><th>Record status</th><th>Attendance</th></tr></thead><tbody>${subjects.map((x,i)=>`<tr><td><b>${x[1]}</b><small>${x[0]}</small></td><td>${x[2]}</td><td>${typeof statusBadge==='function'?statusBadge(i===2&&status==='Present'?'Late':status):escLocal(status)}</td><td>${Math.max(0,s.attendance-i*2)}%</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function renderFacultyOnly(){
    const f=findFaculty();const classes=classesForFaculty(f);const pending=getRequests().filter(x=>x.status==='Pending'&&x.actorId===f.id).length;
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Faculty dashboard</span><h1>${escLocal(f.name)}</h1><p>Only your assigned classes and faculty tools are available here.</p></div>${profileBlock(f,'Faculty')}<section class="card assigned-classes"><div class="card-title">Assigned classes</div><div class="card-subtitle">Select a class from Attendance to view its roster.</div><div class="class-list">${classes.map(c=>`<a href="#attendance?class=${c.id}" class="class-row"><span><b>${c.name}</b><small>${c.id} · Section ${c.section}</small></span><span>Open →</span></a>`).join('')}</div></section><section class="role-actions"><a class="primary-btn" href="#attendance">Open attendance</a><a class="secondary-btn" href="#reports">View my reports</a><button class="secondary-btn" id="request-profile-change">Request profile change</button></section>${pending?`<div class="role-note"><b>${pending} request(s) waiting for admin approval.</b><p>Faculty changes do not update records until the administrator approves them.</p></div>`:''}`;
    $('#request-profile-change')?.addEventListener('click',()=>openFacultyProfileRequest(f));
  }
  function openFacultyProfileRequest(f){
    $('#modal-region').innerHTML=`<div class="modal-backdrop" id="security-modal"><div class="modal"><h2>Request profile change</h2><p>This request will be sent to the administrator. Your profile will not change now.</p><div class="modal-grid"><label>Phone number<input id="request-phone" value="${escLocal(f.phone||'')}"></label><label>Subject<input id="request-subject" value="${escLocal(f.subject||'')}"></label></div><div class="modal-footer"><button class="secondary-btn" id="cancel-security-modal">Cancel</button><button class="primary-btn" id="send-profile-request">Send request</button></div></div></div>`;
    $('#cancel-security-modal').onclick=()=>$('#modal-region').innerHTML='';
    $('#send-profile-request').onclick=()=>{submitRequest('faculty-profile',{facultyId:f.id,changes:{phone:$('#request-phone').value,subject:$('#request-subject').value}});$('#modal-region').innerHTML='';renderFacultyOnly()};
  }
  function assignedRoster(classId){
    const list=getStudents();
    const cls=classCatalog.find(c=>c.id===classId);
    return list.filter(s=>!cls||s.department===cls.department||classId==='CS-603').length?list.filter(s=>!cls||s.department===cls.department||classId==='CS-603'):list;
  }
  function renderFacultyOnlyAttendance(){
    const f=findFaculty();const classes=classesForFaculty(f);const params=new URLSearchParams(location.hash.split('?')[1]||'');const selected=params.get('class')||localStorage.getItem('faculty-selected-class-'+f.id)||classes[0]?.id||'CS-601';localStorage.setItem('faculty-selected-class-'+f.id,selected);const roster=assignedRoster(selected);const attendance=getAttendance();const requests=getRequests();const drafts={};
    const pendingByStudent=(id)=>{const r=requests.find(x=>x.status==='Pending'&&x.actorId===f.id&&x.type==='attendance'&&x.payload.classId===selected&&x.payload.studentId===id);return r?.payload.status};
    const render=()=>{const counts={Present:0,Late:0,Absent:0};roster.forEach(s=>counts[drafts[s.id]||pendingByStudent(s.id)||attendance[s.id]||'Present']++);$('#faculty-attendance-area').innerHTML=`<div class="attendance-summary">${Object.keys(counts).map(k=>`<div class="card summary-card"><span class="metric-glyph ${k.toLowerCase()}">●</span><div><label>${k}</label><strong>${counts[k]}</strong></div></div>`).join('')}</div><section class="card table-card"><div class="toolbar"><select id="faculty-class-select">${classes.map(c=>`<option value="${c.id}" ${c.id===selected?'selected':''}>${c.id} · ${c.name} · ${c.section}</option>`).join('')}</select><button class="primary-btn" id="submit-attendance-request">Send changes for approval</button></div><p class="approval-help">Changes are saved as a request. The attendance record changes only after an administrator approves it.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Student</th><th>Student ID</th><th>Current record</th><th>Requested status</th></tr></thead><tbody>${roster.map(s=>{const current=pendingByStudent(s.id)||attendance[s.id]||'Present';const chosen=drafts[s.id]||current;return `<tr><td><b>${escLocal(s.name)}</b><small>${escLocal(s.email)}</small></td><td>${escLocal(s.id)}</td><td>${typeof statusBadge==='function'?statusBadge(current):current}</td><td class="attendance-action">${['Present','Late','Absent'].map(st=>`<button class="${chosen===st?'selected '+st.toLowerCase():''}" data-security-student="${s.id}" data-security-status="${st}">${st}</button>`).join('')}</td></tr>`}).join('')}</tbody></table></div></section>`;
      $('#faculty-class-select').onchange=e=>{location.hash='attendance?class='+encodeURIComponent(e.target.value)};
      $('#faculty-attendance-area').querySelectorAll('[data-security-student]').forEach(btn=>btn.onclick=()=>{drafts[btn.dataset.securityStudent]=btn.dataset.securityStatus;render()});
      $('#submit-attendance-request').onclick=()=>{Object.entries(drafts).forEach(([studentId,status])=>{if(status!==attendance[studentId])submitRequest('attendance',{classId:selected,studentId,status})});showToast('Request sent','The administrator must approve these attendance changes.');renderFacultyOnlyAttendance()};
    };
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Faculty attendance</span><h1>Class register</h1><p>Choose one of your assigned classes. Student records are not changed directly by faculty.</p></div><div id="faculty-attendance-area"></div>`;render();
  }
  function renderFacultyOnlyReports(){
    const f=findFaculty();const classes=classesForFaculty(f);const attendance=getAttendance();const students=getStudents();
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Faculty reports</span><h1>My class reports</h1><p>Only classes assigned to ${escLocal(f.name)} are listed.</p></div><section class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Class</th><th>Students</th><th>Present</th><th>Late</th><th>Absent</th></tr></thead><tbody>${classes.map(c=>{const roster=assignedRoster(c.id);const vals=roster.map(s=>attendance[s.id]||'Present');return `<tr><td><b>${c.name}</b><small>${c.id} · ${c.section}</small></td><td>${roster.length}</td><td style="color:#2a9b7b">${vals.filter(x=>x==='Present').length}</td><td style="color:#c58c3f">${vals.filter(x=>x==='Late').length}</td><td style="color:#d56872">${vals.filter(x=>x==='Absent').length}</td></tr>`}).join('')}</tbody></table></div></section>`;
  }
  function submitRequest(type,payload){
    const f=findFaculty();const requests=getRequests();requests.push({id:'REQ-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),type,status:'Pending',actorRole:'Faculty',actorId:f.id,actorName:f.name,payload,createdAt:new Date().toISOString()});write('cloud-change-requests',requests);shellNav();
  }
  function renderAdminRequests(){
    const requests=getRequests();
    $('#page').innerHTML=`<div class="role-page-head"><span class="eyebrow">Administrator only</span><h1>Approval requests</h1><p>Review changes submitted by faculty. Nothing is applied until you approve it.</p></div><section class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Request</th><th>Submitted by</th><th>Details</th><th>Status</th><th>Action</th></tr></thead><tbody>${requests.length?requests.slice().reverse().map(r=>`<tr><td><b>${r.type==='attendance'?'Attendance change':'Faculty profile change'}</b><small>${new Date(r.createdAt).toLocaleString()}</small></td><td>${escLocal(r.actorName)}<small>${escLocal(r.actorId)}</small></td><td>${r.type==='attendance'?`${escLocal(r.payload.classId)} · ${escLocal(r.payload.studentId)} → <b>${escLocal(r.payload.status)}</b>`:`Phone: ${escLocal(r.payload.changes.phone)}<br>Subject: ${escLocal(r.payload.changes.subject)}`}</td><td><span class="request-status ${r.status.toLowerCase()}">${r.status}</span></td><td>${r.status==='Pending'?`<button class="primary-btn request-action" data-request="${r.id}" data-decision="Approved">Approve</button><button class="secondary-btn request-action" data-request="${r.id}" data-decision="Rejected">Reject</button>`:'No action'}</td></tr>`).join(''):'<tr><td colspan="5">No requests yet.</td></tr>'}</tbody></table></div></section>`;
    document.querySelectorAll('.request-action').forEach(btn=>btn.onclick=()=>decideRequest(btn.dataset.request,btn.dataset.decision));
  }
  function decideRequest(id,decision){
    const requests=getRequests();const req=requests.find(x=>x.id===id);if(!req)return;
    if(decision==='Approved'){
      if(req.type==='attendance'){const attendance=getAttendance();attendance[req.payload.studentId]=req.payload.status;write('cloud-attendance',attendance)}
      if(req.type==='faculty-profile'){const faculty=getFaculty().map(f=>f.id===req.payload.facultyId?{...f,...req.payload.changes}:f);write('cloud-faculty',faculty)}
    }
    req.status=decision;write('cloud-change-requests',requests);showToast(decision==='Approved'?'Request approved':'Request rejected',decision==='Approved'?'The change is now applied.':'The record was left unchanged.');shellNav();renderAdminRequests();
  }
  function secureRender(){
    if(!guard())return;
    shellNav();
    const r=role(),route=currentRoute();
    if(r==='Student'){if(route==='dashboard')renderStudentOnly();else renderStudentOnlyAttendance();return}
    if(r==='Faculty'){if(route==='dashboard')renderFacultyOnly();else if(route==='attendance')renderFacultyOnlyAttendance();else if(route==='reports')renderFacultyOnlyReports();else if(typeof window[route==='system-status'?'renderSystem':route==='messages'?'renderMessages':route==='timetable'?'renderTimetable':'renderDashboard']==='function')window[route==='messages'?'renderMessages':route==='timetable'?'renderTimetable':'renderDashboard']();return}
    if(r==='Admin'&&route==='requests'){renderAdminRequests();return}
    if(typeof window[route==='dashboard'?'renderDashboard':route==='students'?'renderStudents':route==='faculty'?'renderFaculty':route==='attendance'?'renderAttendance':route==='reports'?'renderReports':route==='timetable'?'renderTimetable':route==='messages'?'renderMessages':route==='settings'?'renderSettings':route==='system-status'?'renderSystem':'renderDashboard']==='function')window[route==='dashboard'?'renderDashboard':route==='students'?'renderStudents':route==='faculty'?'renderFaculty':route==='attendance'?'renderAttendance':route==='reports'?'renderReports':route==='timetable'?'renderTimetable':route==='messages'?'renderMessages':route==='settings'?'renderSettings':route==='system-status'?'renderSystem':'renderDashboard']();
  }
  function initSecurity(){
    const form=$('#login-form');
    form?.addEventListener('submit',()=>{saveIdentity();setTimeout(secureRender,320)});
    window.addEventListener('hashchange',secureRender);
    if(role())setTimeout(secureRender,0);
  }
  initSecurity();
})();
