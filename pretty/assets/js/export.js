// export.js

export function downloadCSV(filename, data) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPostsMetrics(postsData) {
  const headers = ["Post ID", "Post Text", "Likes", "Reposts", "Replies", "Quotes", "Created At"];
  const csvRows = [headers.join(",")];
  postsData.forEach(post => {
    const values = headers.map(header => `"${post[header] || ""}"`);
    csvRows.push(values.join(","));
  });
  return csvRows.join("\n");
}

export function exportAccountMetrics(profileData) {
  const accountMetrics = {
    "Posts Count": profileData.postsCount || 0,
    "Lists Count": profileData.associatedListsCount || 0,
    "Feeds Count": profileData.feedsCount || 0,
    "Starterpacks Count": profileData.starterpacksCount || 0,
    "Followers Count": profileData.followersCount || 0,
    "Following Count": profileData.followsCount || 0
  };
  const csvRows = ["Metric,Value"];
  for (const key in accountMetrics) {
    csvRows.push(`${key},${accountMetrics[key]}`);
  }
  return csvRows.join("\n");
}