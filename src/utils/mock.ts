import Chance from 'chance'

export function generateData() {
  const chance = new Chance()

  // Generate users
  const users = Array.from({ length: 100 }, () => ({
    id: chance.guid(),
    type: 'User',
    name: chance.name(),
    age: chance.age({ min: 18, max: 60 }),
    gender: chance.gender({ extraGGenders: [] }),
  }))

  // Generate posts
  const posts = Array.from({ length: 50 }, () => ({
    id: chance.guid(),
    type: 'Post',
    content: chance.paragraph({ sentences: 3 }),
    timestamp: chance.date({ year: new Date().getFullYear() - 1 }),
  }))

  // Generate comments
  const comments = Array.from({ length: 200 }, () => ({
    id: chance.guid(),
    type: 'Comment',
    content: chance.sentence(),
    timestamp: chance.date({ year: new Date().getFullYear() - 1 }),
  }))

  // Generate edges
  const friendEdges = []
  const postedEdges = []
  const commentedEdges = []
  const commentOnEdges = []

  users.forEach((user) => {
    // Generate FRIEND edges
    const friendCount = chance.integer({ min: 1, max: 10 })
    for (let i = 0; i < friendCount; i++) {
      friendEdges.push({
        id: chance.guid(),
        type: 'FRIEND',
        source: user.id,
        target: chance.pickone(users).id,
        since: chance.date({ year: new Date().getFullYear() - 5 }),
      })
    }

    // Generate POSTED edges
    const userPosts = chance.pickset(posts, chance.integer({ min: 1, max: 5 }))
    userPosts.forEach((post) => {
      postedEdges.push({
        id: chance.guid(),
        type: 'POSTED',
        source: user.id,
        target: post.id,
        timestamp: post.timestamp,
      })
    })

    // Generate COMMENTED edges
    const userComments = chance.pickset(comments, chance.integer({ min: 1, max: 10 }))
    userComments.forEach((comment) => {
      commentedEdges.push({
        id: chance.guid(),
        type: 'COMMENTED',
        source: user.id,
        target: comment.id,
        timestamp: comment.timestamp,
      })

      // Generate COMMENT_ON edges
      commentOnEdges.push({
        id: chance.guid(),
        type: 'COMMENT_ON',
        source: comment.id,
        target: chance.pickone(posts).id,
        timestamp: comment.timestamp,
      })
    })
  })

  // Combine nodes and edges
  const graphData = {
    nodes: [...users, ...posts, ...comments],
    edges: [
      ...friendEdges,
      ...postedEdges,
      ...commentedEdges,
      ...commentOnEdges,
    ],
  }

  return graphData
}
