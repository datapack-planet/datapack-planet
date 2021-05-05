import React, { useEffect, useState } from 'react';
import path from 'path';
import glob from 'glob';
import FileList from './FileList';
import './Body.scss';
import watch from 'node-watch';
import { IGroup } from '@fluentui/react';
import EditorView from './EditorView';

export interface IFileListItem {
  type: string;
  name: string;
  dir: string;
  dirR?: string;
}

export default function Body(): JSX.Element {
  const filePath = path.resolve(sessionStorage.getItem('dir'), './data');
  const [items, setItems] = useState<IFileListItem[]>(_getFileListItems());
  const [groups, setGroups] = useState<IGroup[]>(_getGroups());

  function _getFileListItems(): Array<IFileListItem> {
    function generateType(pathname: string): IFileListItem {
      const typeList = pathname.match(/(functions|advancements|recipes|loot_tables|predicates|tags)/g);
      const nameList = pathname.match(/.*\/(functions|advancements|recipes|loot_tables|predicates|tags)\/(.*\/)?.*\./g);
      const names = nameList[0];
      const [, nameNS, , ...pathTo] = names.split(/\//g);
      const pathToValid = pathTo.join('/').slice(0, pathTo.join('/').length - 1);
      const name = `${nameNS}:${pathToValid}`;

      return {
        type: typeList[0],
        name: name,
        dir: path.resolve(filePath, pathname),
        dirR: pathname,
      };
    }
    const JSONSchemas = glob.sync('./*/@(advancements|recipes|loot_tables|predicates|tags)/**/*.json', {
      cwd: filePath,
    });
    const MCFunctions = glob.sync('./*/functions/**/*.mc' + 'function', {
      cwd: filePath,
    });

    const fileList: Array<IFileListItem> = [];
    [...JSONSchemas, ...MCFunctions].forEach((item: string) => fileList.push(generateType(item)));
    // Sort with file name
    fileList.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      if (a.name > b.name) return 0;
    });
    // Sort with type
    fileList.sort((a, b) => {
      if (a.type < b.type) return -1;
      if (a.type > b.type) return 1;
      if (a.type > b.type) return 0;
    });
    return fileList;
  }

  function _getGroups() {
    let advancements = 0,
      lootTables = 0,
      dimensions = 0,
      dimensionTypes = 0,
      tags = 0,
      functions = 0;

    _getFileListItems().forEach((item: IFileListItem) => {
      if (item.type === 'advancements') advancements += 1;
      if (item.type === 'functions') functions += 1;
      if (item.type === 'dimension') dimensions += 1;
      if (item.type === 'dimension_types') dimensionTypes += 1;
      if (item.type === 'loot_tables') lootTables += 1;
      if (item.type === 'tags') tags += 1;
    });

    // Those groups are its id
    // Each group referenced group.startIndex is a shorthand of adding all items count
    const group1: IGroup = advancements
      ? {
          key: 'group1',
          name: 'Advancements',
          startIndex: 0,
          count: advancements,
        }
      : undefined;
    const group2: IGroup = dimensions
      ? {
          key: 'group2',
          name: 'Dimensions',
          startIndex: advancements,
          count: dimensions,
        }
      : undefined;
    const group3: IGroup = dimensionTypes
      ? {
          key: 'group3',
          name: 'Dimension Types',
          startIndex: group2.startIndex + dimensions,
          count: dimensionTypes,
        }
      : undefined;
    const group4: IGroup = functions
      ? {
          key: 'group4',
          name: 'Functions',
          startIndex: group3.startIndex + dimensionTypes,
          count: functions,
        }
      : undefined;
    const group5: IGroup = lootTables
      ? {
          key: 'group5',
          name: 'Loot Tables',
          startIndex: group4.startIndex + functions,
          count: lootTables,
        }
      : undefined;
    const group6: IGroup = tags
      ? {
          key: 'group6',
          name: 'Tags',
          startIndex: group5.startIndex + lootTables,
          count: tags,
        }
      : undefined;

    // If no item in group, it will be filter off
    return [group1, group2, group3, group4, group5, group6].filter(Boolean);
  }

  useEffect(() => {
    // only watch once to saving resource
    watch(filePath, { recursive: true }, () => {
      setGroups(_getGroups());
      setItems(_getFileListItems());
    });
  }, []);

  return (
    <div className="body">
      <div className="body-col">
        <FileList items={items} groups={groups} />
      </div>
      <div className="body-col">
        <EditorView />
      </div>
    </div>
  );
}
