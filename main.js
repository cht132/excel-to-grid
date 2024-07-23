    window.tailwind.config = {
      darkMode: ['class'],
      theme: {
        extend: {
          colors: {
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
              DEFAULT: 'hsl(var(--primary))',
              foreground: 'hsl(var(--primary-foreground))'
            },
            secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))'
            },
            destructive: {
              DEFAULT: 'hsl(var(--destructive))',
              foreground: 'hsl(var(--destructive-foreground))'
            },
            muted: {
              DEFAULT: 'hsl(var(--muted))',
              foreground: 'hsl(var(--muted-foreground))'
            },
            accent: {
              DEFAULT: 'hsl(var(--accent))',
              foreground: 'hsl(var(--accent-foreground))'
            },
            popover: {
              DEFAULT: 'hsl(var(--popover))',
              foreground: 'hsl(var(--popover-foreground))'
            },
            card: {
              DEFAULT: 'hsl(var(--card))',
              foreground: 'hsl(var(--card-foreground))'
            },
          },
        }
      }
    }

    function sortStatus(data) {
      // Custom order for status
      const statusOrder = {
        "Mainstream": 0,
        "Emerging": 1,
        "Sunset": 2,
        "Retire": 3
      };

      // Function to compare arrays based on columns 1, 2, 3, and then status
      function compareArrays(a, b) {
        for (let i = 0; i <= 2; i++) {
          if (a[i] < b[i]) return -1;
          if (a[i] > b[i]) return 1;
        }
        return statusOrder[a[4]] - statusOrder[b[4]];
      }

      // Sort the data
      data.sort(compareArrays);

      return data;
    }

    function generateContent(data) {
      function countUniqueCategories(data) {
        const uniqueCounts = {};

        data.forEach(item => {
          const firstCategory = item[0]; // Get the first category
          const secondCategory = item[1]; // Get the second category
          const uniqueIdentifier = item[2]; // Assuming this is the unique identifier

          if (secondCategory) {
            const key = `${firstCategory},${secondCategory}`; // Create a combined key

            if (!uniqueCounts[key]) {
              uniqueCounts[key] = { uniqueIdentifiers: new Set(), count: 0 };
            }
            uniqueCounts[key].uniqueIdentifiers.add(uniqueIdentifier); // Add unique identifier to the Set
            uniqueCounts[key].count++; // Increment the row count
          }
        });

        // Convert to an array and map to [firstCategory, secondCategory, uniqueCount, rowCount]
        const result = Object.entries(uniqueCounts).map(([key, value]) => {
          const [first, second] = key.split(','); // Split the combined key
          return [first, second, value.uniqueIdentifiers.size, value.count]; // Return the desired format
        });

        // Sort by unique count in descending order, then by row count in descending order
        result.sort((a, b) => {
          if (b[2] === a[2]) { // If unique counts are the same
            return b[3] - a[3]; // Sort by row count
          }
          return b[2] - a[2]; // Sort by unique count
        });

        // Add entries with a count of 1 if they don't exist
        const allCategories = new Set(data.map(item => `${item[0]},${item[1]}`));
        allCategories.forEach(category => {
          if (!result.some(entry => `${entry[0]},${entry[1]}` === category)) {
            result.push([category.split(',')[0], category.split(',')[1], 1, 1]); // Default row count to 1
          }
        });

        return result;
      }

      function sortDataByCategoryCount(data) {
        const counts = countUniqueCategories(data);
        // Create a mapping of category pairs to their counts
        const categoryOrder = counts.map(item => `${item[0]},${item[1]}`); // Combine first and second categories

        // Sort the original data based on the combined category order
        const sortedData = data.sort((a, b) => {
          const keyA = `${a[0]},${a[1]}`;
          const keyB = `${b[0]},${b[1]}`;

          const indexA = categoryOrder.indexOf(keyA);
          const indexB = categoryOrder.indexOf(keyB);

          return indexA - indexB; // Sort based on index
        });

        return sortedData;
      }

      const result = sortDataByCategoryCount(data);


      const contentDiv = document.getElementById('content');
      contentDiv.classList.add(`lg:grid-cols-2`, "grid", "gap-2")
      const categories = {};

      data.forEach(([cat, sub, type, name, ...rest]) => {
        categories[cat] = categories[cat] || {};
        categories[cat][sub] = categories[cat][sub] || {};
        categories[cat][sub][type] = categories[cat][sub][type] || [];
        categories[cat][sub][type].push({ name, data: [cat, sub, type, name, ...rest] });
      });
      rowTotal = 0
      cardCount = 0
      largestCard = 0
      Object.keys(categories).forEach(cat => {
        subCatTotal = 0
        let totalShortTypeCount = 0;
        const catDiv = createElement('div', `bg-foreground text-foreground p-2 rounded-lg bg-violet-300`, `<h2 class="text-lg lg:text-xl font-bold mb-2">${cat}</h2>`);
        const catGrid = createElement('div', 'grid grid-cols-[repeat(auto-fit,minmax(200px,2fr))] gap-2');
        Object.keys(categories[cat]).forEach(sub => {
          const subCategories = categories[cat][sub];
          const subLength = Object.keys(subCategories).length;
          const shortTypeCount = Object.keys(subCategories).reduce((count, type) => (subCategories[type].length <= 4 ? count + 1 : count), 0);
          totalShortTypeCount += subLength === 1 ? 1 : 2;
          const subDiv = createElement('div',
            `bg-card text-card-foreground p-2 rounded-lg border border-border mb-1 ${shortTypeCount <= 2 ? '' : 'row-span-2'} ${subLength === 1 ? '' : 'col-span-2'}`,
            `<div class="lg:text-xl font-bold mb-0">${sub}</div><hr class="border-border my-1" />`
          );
          const typeGrid = createElement('div', subLength === 1 ? 'grid grid-cols-1' : 'grid grid-cols-1 grid-cols-2 gap-2');
          Object.keys(subCategories).forEach((type, index) => {
            const items = subCategories[type];
            const typeDiv = createElement('div',
              `${index % 2 === 0 && subLength !== 1 ? 'border-r border-border pr-1' : 'pr-1'}`,
              `<div class="font-semibold mb-0">${type != "null" ? type : ""}</div>`
            );
            const ul = createElement('ul', 'space-y-0');
            items.forEach(item => {
              ul.appendChild(createElement('li',
                `text-sm lg:text-base flex items-center font-semibold item`,
                `<span class="w-2.5 h-2.5 bg-slate-950 rounded-full mr-2"></span>${item.name}`,
                item.data
              ));
            });
            typeDiv.appendChild(ul);
            typeGrid.appendChild(typeDiv);
          });
          subDiv.appendChild(typeGrid);
          catGrid.appendChild(subDiv);
          subCatTotal += Object.keys(subCategories).length
        });
        if (rowTotal + subCatTotal < 10) {
          cardCount++
          rowTotal += subCatTotal
          largestCard = largestCard < cardCount ? cardCount : largestCard
        } else {
          rowTotal = 0
          cardCount = 0
        }
        // if (totalShortTypeCount < 10) {
        //   console.log(totalShortTypeCount)
        //   catGrid.classList.remove('2xl:grid-cols-10');
        //   catGrid.classList.remove('xl:grid-cols-8');
        //   catGrid.classList.remove('lg:grid-cols-6');
        //   catGrid.classList.remove('md:grid-cols-4');
        //   catGrid.classList.add(`2xl:grid-cols-${totalShortTypeCount}`,
        //     `xl:grid-cols-${totalShortTypeCount <= 8 ? totalShortTypeCount : '8'}`,
        //     `lg:grid-cols-${totalShortTypeCount <= 6 ? totalShortTypeCount : '6'}`,
        //     `md:grid-cols-${totalShortTypeCount <= 4 ? totalShortTypeCount : '4'}`
        //   );
        // Array.from(catGrid.children).forEach(div => div.classList.add('2xl:row-span-2'));
        // }
        // if (totalShortTypeCount > 4) {
        contentDiv.classList.remove(`lg:grid-cols-2`)
        contentDiv.classList.add(`lg:grid-cols-1`)
        // }
        catDiv.appendChild(catGrid);
        contentDiv.appendChild(catDiv);
      });

      if (largestCard > 3) { contentDiv.classList.add(`lg:grid-cols-2`, `xl:grid-cols-3`, `2xl:grid-cols-[repeat(auto-fit,minmax(220px,2fr))]`); }
      else if (largestCard > 1) { contentDiv.classList.add(`xl:grid-cols-${largestCard}`) }

      function createElement(type, className, innerHTML = '', data = '') {
        const element = document.createElement(type);
        element.className = className;
        element.innerHTML = innerHTML;
        element.setAttribute('data', data);
        return element;
      }
    }
    function UpdateItemColor() {
      let items = document.querySelectorAll('.bg-foreground.text-foreground');
      items.forEach(item => {
        item.classList.remove('bg-violet-300');
        item.classList.add('bg-violet-300');
      });
      items = document.querySelectorAll('.item');
      const statusColors = { "Emerging": "blue", "Mainstream": "green", "Sunset": "yellow", "Retire": "red" };
      items.forEach(item => {
        const dataArray = item.getAttribute('data').split(',');
        const status = dataArray[4];
        const color = statusColors[status];
        item.classList.add(`text-${color}-600`);
        const span = item.querySelector('span');
        span.classList.remove('bg-slate-950');
        span.classList.add(`bg-${color}-500`);
      })
    }
