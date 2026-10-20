Check trade-blotter-exercise in downloads folder. We are going to develop this application in parallel using herdr to create multiple sessions + worktrees. 

First, create a GitHub repository that is public. Add this prompt (saved as prompt.md in downloads) into the repository. 

We will do this in 3 parts. 
1. Creating the skeleton project with C# and Vue frontend (1 agent)
2. Creating .NET backend (1 agent) as well as Vue frontend (1 agent) in full.
3. Merging both pieces, then doing a full e2e test using playwright. 

Part 1. Skeleton project
This is the part where we add data models, set up libraries, as well as mutation testing frameworks, and CLAUDE.md + hooks. Each top bullet item is practically a commit. 

- Create CLAUDE.md file based on the requirements file. Add prompt-based rules as well as commit guidelines. Commits should cover one meaningful feature at a time and should be concise and to the point in the message. Create a README.md skeleton that CLAUDE.md specifies will need to be filled out every time configuration changes. We will specify at least 80% test coverage for unit tests.
- Install relevant skills and MCP servers for the project. AG-grid is one. 
- We will use Stryker.NET and maybe Stryker.js for mutation testing. I suspect they will be more useful for the backend, and we probably don't need it for frontend.
- Hooks must lint every file that is touched. For linting, we will use Biome for js and CSharpier for C#. Commits should run tests and linters. 
- We need other developer friendly tools, custom or otherwise, that prevents files from being over 500 lines long as a soft limit. Use knip, jscpd, etc. 
- Create skeleton endpoints for POST, GET. 
  - Submitting a new trade requires, symbol, side, quantity, price, timestamp. Optionally requires timezone.
  - Getting trades requires no parameters.
  - Getting positions requires no parameters.
  - In an ideal world we would be adding server side pagination. But it introduces a lot of questions about missing data in-between fetches, especially if we add sorting & filtering. So we will just return everything for now. 
- Create data models and set up the local database. 
  - A trade record:
    {
    	uid: uuid
    	userId: uuid, foreign key
    	symbol: string
    	side: Enum {Buy, Sell} // question- will other types exist at all?
    	quantity: double
    	price: double
    	timestamp: DateTime // stored in UTC, api should accept timezone info (assume NYC if empty) and convert.
    } 
  - Positions (assumed always current). Does a dictionary over symbols as keys work better here?
    {
    	symbol: string
    	net_quantity: double
    	avg_price: double 
    }
    We can just use weighted averages to compute positions. Since net position is a double value, we will need to define 0 as anything less than a cent.
  - User:
    {
    	uid: uuid
    	id: string // not adding password - not really in scope. This is just for storing settings
    	timezone: string, default nyc (derived from TimeZoneInfo)
    }
- Use SQLite for this. We will use EF to query for these datasets. The table should easily fall out based on the above data models. 

Part 2. Create backend & frontend
This part can be parallelized fairly easily. 

- Backend (each bullet is a task/commit)
  - Simply fill out the api endpoints using entity framework. The controller will contain api endpoints themselves for trades and positions. But business logic for computing positions and actually getting the data via entity framework will be in features folder. We will have a trades feature set and a positions feature set to start. 
  - Use mutation testing on business logic to test for mutation coverage. This will be especially important for positions.
  - Make sure error handling & HTP codes are respected. 
- Frontend (each bullet is a task/commit)
  - Prefer use of display: grid everywhere. 
  - Use ag-grid for grid application. It supports live updates, column sorting & filtering. We end up getting most of the functionality for free. 
    - Note we do not have access to enterprise features.
  	- use a custom cell renderer to render buy/sell with red/green text. 
  	- Add grid search using an external filter. 
  - I feel that trades & positions can be a separate injectable service in the application. 
    - when trades are submitted, based on the http response the grid should just re-get all of the trades from the server. This is because of timing issues. We could alternatively add a "since" parameter to the API that returns all data since the last time data was retrieved by frontend. 
  - Trade entry form should be a button on the top bar above the grid. We will use this as a toolbar that has quick filter and + for add trade. It will open a modal, with an option to add one trade at a time (form) vs. an editable grid that you can paste into. It will also have a timezone setting defaulting to NYC. 
  - The blotter can be a single page application just showing the blotter itself, the modal, and the positions panel. Use PrimeVue as a component library.  

Part 3. E2E testing and UI design
- Use playwright and take screenshots of the whole application flow. Make sure everything is well-spaced, and makes sense for the user. For example, are column orders laid out in a sensible manner for a trader? Are buttons spaced correctly, and are input boxes laid out in a grid that makes sense, rather than being closed and far too close together? Are input boxes labelled clearly, for example in small lettering above the input box, not taking up all the space in the modal? Is the grid taking up too much space or too little? Is the application a soft hue that is pleasant to look at with a consistent theme?
- Recon the code & folder structure and make sure everything is readable and sorted into a folder structure that is intuitive. Note the architecture of the code closely. I am following a UI -> Controller -> Business logic architecture, which should be fairly simple.
- Use another subagent (several if needed) to make sure that all surfaces of the design document, as well as the above prompt is fully covered. 

You are the coordinator agent, responsible for managing multiple herdr sessions. Let's smack out a few open questions before tackling the rest of this.


