const PROFILE_API = "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile";
const POSTS_API = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";

let profileChartInstance = null;

document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }
  document.getElementById("error-message").style.display = "none";
  document.getElementById("report-section").style.display = "none";

  try {
    const [profileData, postsData] = await Promise.all([
      fetch(`${PROFILE_API}?actor=${username}`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile data.");
        return res.json();
      }),
      fetch(`${POSTS_API}?actor=${username}&limit=100&filter=posts_with_replies`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch posts data.");
        return res.json();
      })
    ]);

    document.getElementById("user-handle").textContent = profileData.handle;
    document.getElementById("user-handle").href = `https://bsky.app/profile/${username}`;

    const chartData = {
      labels: ["Followers", "Following"],
      datasets: [{
        label: "Profile Metrics",
        data: [profileData.followersCount || 0, profileData.followsCount || 0],
        backgroundColor: ["#0071bc", "#4aa564"]
      }]
    };

    if (profileChartInstance) {
      profileChartInstance.destroy();
    }

    const ctx = document.getElementById("profileChart").getContext("2d");
    profileChartInstance = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Update hero metrics
    document.getElementById("posts-count").textContent = profileData.postsCount || 0;
    document.getElementById("lists-count").textContent = profileData.associatedListsCount || 0;
    document.getElementById("feeds-count").textContent = profileData.feedsCount || 0;
    document.getElementById("starterpacks-count").textContent = profileData.starterpacksCount || 0;

    const postsTable = document.getElementById("posts-table");
    postsTable.innerHTML = "";
    for (const item of postsData.feed || []) {
      const post = item.post;
      const record = post.record || {};
      const postId = post.uri.split("/").pop();
      const postLink = `https://bsky.app/profile/${username}/post/${postId}`;
      const createdAt = new Date(record.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const row = `
        <tr>
          <td><a href="${postLink}" target="_blank">${postId}</a></td>
          <td>${(record.text || "N/A").replace(/\n/g, " ")}</td>
          <td>${post.likeCount || 0}</td>
          <td>${post.repostCount || 0}</td>
          <td>${post.replyCount || 0}</td>
          <td>${post.quoteCount || 0}</td>
          <td>${createdAt}</td>
        </tr>
      `;
      postsTable.insertAdjacentHTML("beforeend", row);
    }
    document.getElementById("report-section").style.display = "block";

  } catch (error) {
    document.getElementById("error-message").style.display = "block";
    console.error("Failed to fetch data", error);
  }
});