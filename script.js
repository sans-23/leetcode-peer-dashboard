const users = ['sans-23', 'restart24', 'restart2024', 'tushika_', 'restart_ykm_21', 'revanthreddy0612', 'paras_bhai', 'Sonal_Tulasyan', 'chvishal281', 'restart2k24']; // Add more usernames to track here.

const userTab = document.getElementById('user-tab');
const problemTab = document.getElementById('problem-tab');
const userList = document.getElementById('user-list');
const problemList = document.getElementById('problem-list');

// Toggle panels
userTab.addEventListener('click', () => {
  userTab.classList.add('active');
  problemTab.classList.remove('active');
  userList.classList.add('active');
  problemList.classList.remove('active');
});

problemTab.addEventListener('click', () => {
  problemTab.classList.add('active');
  userTab.classList.remove('active');
  problemList.classList.add('active');
  userList.classList.remove('active');
});

async function fetchLeetCodeData(username) {
  const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
  const data = await response.json();
  return data;
}

// Filter submissions within the last 24 hours (today)
function getRecentSubmissions(submissions) {
  const now = Math.floor(Date.now() / 1000);
  const twentyFourHoursAgo = now - 24 * 60 * 60;
  return submissions.filter(submission => submission.timestamp >= twentyFourHoursAgo);
}

// Filter submissions within the last 7 days (week)
function getWeeklySubmissions(submissions) {
  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  return submissions.filter(submission => submission.timestamp >= sevenDaysAgo);
}

// Filter submissions within the last 30 days (month)
function getMonthlySubmissions(submissions) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
  return submissions.filter(submission => submission.timestamp >= thirtyDaysAgo);
}

// Create a list item for each submission
function createSubmissionList(submissions) {
  return submissions.map(submission => `
    <li class="submission-item">
      <span>
      ${new Date(submission.timestamp * 1000).toLocaleString()} - 
      <strong>${submission.title}</strong> (${submission.lang}) 
      </span>
      <span class="status-${submission.statusDisplay.toLowerCase().replace(/ /g, '-')}" >${submission.statusDisplay}</span>
    </li>
  `).join('');
}

function toggleSubmissions(event) {
  const li = event.currentTarget;
  li.classList.toggle('active');
}

function padNumber(number, pad) {
  return number.toString().padStart(pad, '0'); // Pad the number to 4 digits with leading zeros
}

// Create a user list item and append submission list
function createUserListItem(userData, username, rank) {
  const li = document.createElement('li');
  li.addEventListener('click', toggleSubmissions);

  const recentSubmissions = getRecentSubmissions(userData.recentSubmissions);
  const weeklySubmissions = getWeeklySubmissions(userData.recentSubmissions);
  const monthlySubmissions = getMonthlySubmissions(userData.recentSubmissions);

  const submissionCountToday = recentSubmissions.length;
  const submissionCountWeek = weeklySubmissions.length;
  const submissionCountMonth = monthlySubmissions.length;

  li.innerHTML = `
    <div class="card-title">
      <span class="user-rank">${rank}. ${username}</span> 
      <span class="solved-data">(Solved ${userData.totalSolved} / ${userData.totalQuestions})</span>
    </div>
    <div class="card-subtitle">
      <span class="status-accepted">E ${padNumber(userData.easySolved, 3)}</span> 
      <span class="status-runtime-error">M ${padNumber(userData.mediumSolved, 3)}</span> 
      <span class="status-wrong-answer">H ${padNumber(userData.hardSolved, 3)}</span> 
      <span class="status-time-limit-exceeded">Aaj ${padNumber(submissionCountToday, 2)}</span>
      <span class="status-weekly">Week ${padNumber(submissionCountWeek, 2)}</span>
      <span class="status-monthly">Mon ${padNumber(submissionCountMonth, 2)}</span>
    </div>
    <ul class="submission-list">
      ${createSubmissionList(monthlySubmissions)}  <!-- Display monthly submissions on click -->
    </ul>
  `;
  return li;
}

function createProblemList(recentSubmissions) {
  const problemList = document.getElementById('problem-list');

  // Sort submissions by timestamp in descending order
  recentSubmissions.sort((a, b) => b.timestamp - a.timestamp);

  const allRecentSubmissions = recentSubmissions.map(submission => `
    <li class="submission-item">
      <span>
        ${new Date(submission.timestamp * 1000).toLocaleString()} - 
        <a href="https://leetcode.com/problems/${submission.titleSlug}" target="_blank" class="problem-link">
          <strong>${submission.title}</strong>
        </a>
        (<i style="font-weight:normal">${submission.username}</i>)
      </span>
      <span class="status-${submission.statusDisplay.toLowerCase().replace(/ /g, '-')}" >
        ${submission.statusDisplay}
      </span>
    </li>
  `).join('');
  problemList.innerHTML = allRecentSubmissions;
}

// Fetch data for all users and sort them based on submissions in the last 24 hours
async function displayRankedUsersAndProblems() {
  const allRecentSubmissions = [];
  const userDataArray = await Promise.all(users.map(async (username) => {
    const userData = await fetchLeetCodeData(username);
    const recentSubmissions = getRecentSubmissions(userData.recentSubmissions);
    const weeklySubmissions = getWeeklySubmissions(userData.recentSubmissions);
    const monthlySubmissions = getMonthlySubmissions(userData.recentSubmissions);

    // Collect recent submissions for problem list
    recentSubmissions.forEach(submission => {
      allRecentSubmissions.push({ ...submission, username });
    });

    return { username, userData, recentSubmissions, weeklySubmissions, monthlySubmissions };
  }));

  // Sort users based on submission count in the last 24 hours
  userDataArray.sort((a, b) => b.recentSubmissions.length - a.recentSubmissions.length);

  // Display sorted and ranked users
  const userList = document.getElementById('user-list');
  userDataArray.forEach((user, index) => {
    const userListItem = createUserListItem(user.userData, user.username, index + 1);
    userList.appendChild(userListItem);
  });

  // Display the problem list
  createProblemList(allRecentSubmissions);
  console.log(allRecentSubmissions);
}

// Initialize the dashboard
displayRankedUsersAndProblems();