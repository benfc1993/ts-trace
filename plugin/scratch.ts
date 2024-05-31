const out = {
  "/project/src/another.ts": {
    //graphNode => nodes[filePath].functions[functionName]: connections.in})
    functions: {
      testingNest: [
        {
          connectionId:
            "/node_modules/typescript/lib/lib.es2015.core.d.ts#repeat",
          functionName: "repeat",
          externalName: "repeat",
          filePath: "/node_modules/typescript/lib/lib.es2015.core.d.ts",
          lineNumber: 12,
        },
      ],
    },
    position: { x: 0, y: 0 },
  },
};

// getNodeById(connectionId){
// const [filePath] = connectionId.split("#")
//  return nodes[filePath]
// }
//
// getFunctionById(connectionId){
// const [filePath, functionName] = connectionId.split("#")
//  return nodes[filePath].functions[functionName]
// }
//
// If a file has a connection to another the upstream should be to the left of the connected file
// Each connection of a file needs to be visited to determine this
// We are going to explore downwards so each connected file should have their position moved to the right of the current file
// check every connection -> position is
// if(!downstreamNode) {
//  nodes[filePath] = {position: {x: upstreamNode.position.x +{spacing}, y: 0}, functions: []}
//  return
// }
// if(upstreamNode.position.x < downstreamNode.position.x -{spacing}) return
// downstreamNode.position.x = upstreamNode.position.x +{spacing}
//
// after all
// loop nodes -> adjustY(node)
//
