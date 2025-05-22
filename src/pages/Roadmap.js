import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import RoadmapBackground from '../components/RoadmapBackground';

const Container = styled.div`
  max-width: 900px;
  margin: 60px auto 0 auto;
  padding: 2.5rem 1.5rem 3rem 1.5rem;
  background: rgba(20, 20, 20, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 157, 0.2);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  color: #fff;
  z-index: 1;
  position: relative;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(20, 20, 20, 0.95);
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 2.8rem;
  font-weight: 900;
  margin-bottom: 0.7rem;
  letter-spacing: 2px;
  font-family: 'Arial Black', sans-serif;
  text-shadow:
    0 0 10px #00ff9d,
    0 0 20px #00ff9d,
    0 0 30px #00ff9d;
  text-transform: uppercase;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  color: white;
  font-size: 1.25rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-shadow:
    0 0 6px #00ff9d88,
    0 0 12px #00ff9d44;
  font-family: 'Arial Black', sans-serif;
`;

const List = styled.ul`
  margin: 0 0 0 1.2rem;
  padding: 0;
  color: #bdbdbd;
  font-size: 1.05rem;
  line-height: 1.7;
  list-style: none;
`;

const IssueItem = styled.li`
  padding: 10px 0;
  border-bottom: 1px solid #222;
  &:last-child {
    border-bottom: none;
  }
  a {
    color: #00ff9d;
    text-decoration: none;
    transition: color 0.2s;
    font-weight: 600;
    &:hover {
      color: #00bfff;
      text-decoration: underline;
    }
  }
`;

const Label = styled.span`
  background: ${({ color }) => `#${color}`};
  color: #111;
  border-radius: 999px;
  padding: 3px 12px;
  margin-left: 8px;
  font-size: 0.92em;
  font-weight: 600;
  display: inline-block;
  vertical-align: middle;
`;

const MilestoneProgress = styled.div`
  background: #222;
  border-radius: 6px;
  height: 12px;
  margin: 12px 0 10px 0;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 0 8px #00ff9d44;
  > div {
    background: linear-gradient(90deg, #00ff9d 0%, #00bfff 100%);
    height: 100%;
    width: ${({ percent }) => percent}%;
    transition: width 0.4s;
  }
`;

const GITHUB_OWNER = 'p5150j';
const GITHUB_REPO = 'DreamReel';

export default function Roadmap() {
  const [milestones, setMilestones] = useState([]);
  const [issues, setIssues] = useState([]);
  const [closedIssues, setClosedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch milestones
      const msRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/milestones?state=open`);
      const msData = await msRes.json();
      setMilestones(msData);

      // Fetch open issues (not pull requests)
      const issuesRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&filter=all`);
      const issuesData = await issuesRes.json();
      setIssues(issuesData.filter(issue => !issue.pull_request));

      // Fetch closed issues (not pull requests)
      const closedIssuesRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=closed&filter=all`);
      const closedIssuesData = await closedIssuesRes.json();
      setClosedIssues(closedIssuesData.filter(issue => !issue.pull_request));
      setLoading(false);
    }
    fetchData();
  }, []);

  // Group issues by milestone
  const issuesByMilestone = {};
  issues.forEach(issue => {
    const msId = issue.milestone ? issue.milestone.id : 'none';
    if (!issuesByMilestone[msId]) issuesByMilestone[msId] = [];
    issuesByMilestone[msId].push(issue);
  });
  const closedIssuesByMilestone = {};
  closedIssues.forEach(issue => {
    const msId = issue.milestone ? issue.milestone.id : 'none';
    if (!closedIssuesByMilestone[msId]) closedIssuesByMilestone[msId] = [];
    closedIssuesByMilestone[msId].push(issue);
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', zIndex: 0 }}>
      <RoadmapBackground />
      <Container>
        <Title>DeepFlix Roadmap</Title>
        {loading && <p>Loading roadmap from GitHub…</p>}
        {!loading && (
          <>
            {milestones.map(ms => {
              const total = ms.open_issues + ms.closed_issues;
              const percent = total === 0 ? 0 : Math.round((ms.closed_issues / total) * 100);
              return (
                <Section key={ms.id}>
                  <SectionTitle>
                    {ms.title} {ms.due_on && <span style={{ color: '#bdbdbd', fontWeight: 400, fontSize: '0.98em' }}>({new Date(ms.due_on).toLocaleDateString()})</span>}
                  </SectionTitle>
                  <div style={{ color: '#bdbdbd', marginBottom: 8 }}>{ms.description}</div>
                  <MilestoneProgress percent={percent}>
                    <div />
                  </MilestoneProgress>
                  <span style={{
                    color: '#00ff9d',
                    fontWeight: 700,
                    fontSize: '0.98em',
                    display: 'block',
                    marginBottom: 8
                  }}>
                    {percent}% complete ({ms.closed_issues} of {total} tasks)
                  </span>
                  <List>
                    {(issuesByMilestone[ms.id] || []).map((issue, idx, arr) => (
                      <IssueItem key={issue.id}>
                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
                        {issue.labels.map(label => (
                          <Label key={label.id} color={label.color}>{label.name}</Label>
                        ))}
                      </IssueItem>
                    ))}
                    {(issuesByMilestone[ms.id] || []).length === 0 && <IssueItem style={{ color: '#666' }}>No open tasks for this milestone.</IssueItem>}
                    {/* Closed tasks */}
                    {(closedIssuesByMilestone[ms.id] || []).map((issue, idx, arr) => (
                      <IssueItem key={issue.id} style={{ color: '#6fcf97', textDecoration: 'line-through', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8, fontSize: '1.1em', color: '#6fcf97', display: 'flex', alignItems: 'center' }}>
                          {/* Unicode checkmark */}
                          ✓
                        </span>
                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6fcf97', textDecoration: 'line-through' }}>{issue.title}</a>
                        {issue.labels.map(label => (
                          <Label key={label.id} color={label.color}>{label.name}</Label>
                        ))}
                      </IssueItem>
                    ))}
                  </List>
                </Section>
              );
            })}
          </>
        )}
      </Container>
    </div>
  );
} 