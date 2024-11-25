const PROFILE_API = "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile";
const POSTS_API = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";

document.getElementById("generate-report").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  document.getElementById("error-message").style.display = "none";
  document.getElementById("report-section").style.display = "none";

  try {
    // Fetch profile data
    const profileResponse = await fetch(`${PROFILE_API}?actor=${username}`);
    if (!profileResponse.ok) throw new Error("Failed to fetch profile data");
    const profileData = await profileResponse.json();

    // Fetch posts
    const postsResponse = await fetch(
      `${POSTS_API}?actor=${username}&limit=100&filter=posts_with_replies`
    );
    if (!postsResponse.ok) throw new Error("Failed to fetch posts data");
    const postsData = await postsResponse.json();

    // Update the user handle
    document.getElementById("user-handle").textContent = profileData.handle;

    // Prepare profile metrics for chart
    const chartData = {
      labels: ["Followers", "Following", "Total Posts"],
      datasets: [
        {
          label: "Profile Metrics",
          data: [
            profileData.followersCount || 0,
            profileData.followsCount || 0,
            profileData.postsCount || 0,
          ],
          backgroundColor: ["#0071bc", "#4aa564", "#d62728"],
        },
      ],
    };

    // Create the chart
    const ctx = document.getElementById("profileChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: chartData,
    });

    // Populate posts table
    const postsTable = document.getElementById("posts-table");
    postsTable.innerHTML = ""; // Clear previous data
    for (const item of postsData.feed || []) {
      const post = item.post;
      const record = post.record || {};
      const row = `
        <tr>
          <td>${post.uri.split("/").pop()}</td>
          <td>${(record.text || "N/A").replace(/\n/g, " ")}</td>
          <td>${post.likeCount || 0}</td>
          <td>${post.repostCount || 0}</td>
          <td>${post.replyCount || 0}</td>
          <td>${post.quoteCount || 0}</td>
          <td>${record.createdAt || "N/A"}</td>
        </tr>
      `;
      postsTable.insertAdjacentHTML("beforeend", row);
    }

    // Show the report section
    document.getElementById("report-section").style.display = "block";