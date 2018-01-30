import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { QUERY_ALL_TASKS, getQueryAllTasksVariables } from './TodoList';

const NewTodoForm = ({ userInfo, mutate }) => {
  const onClick = (event) => {
    event.preventDefault();
    const title = event.target.parentNode.title.value;
    if (!title) return;
    const ownerId = userInfo && userInfo.id;
    const description = event.target.parentNode.description.value;
    const isPrivate = ownerId && event.target.parentNode.isPrivate.checked;
    mutate({ variables: { title, description, ownerId, isPrivate } });
  };
  return (
    <form className="new-task">
      <input name="title" placeholder="Enter title..." />
      <input name="description" placeholder="Enter description..." />
      {userInfo && (
        <div>
          <input
            name="isPrivate"
            type="checkbox"
            style={{ width: 'inherit', marginBottom: 20 }}
          />
          private
        </div>
      )}
      <button type="submit" onClick={onClick}>Add</button>
    </form>
  );
};

const CREATE_TASK = gql`
mutation createTask($title: String!, $description: String, $ownerId: ID, $isPrivate: Boolean) {
  createTask(title: $title, description: $description, ownerId: $ownerId, private: $isPrivate) {
    id
    title
    description
    owner {
      email
      id
    }
    private
  }
}
`;

const config = {
  options: ({ userInfo }) => {
    const variables = getQueryAllTasksVariables(userInfo);
    return {
      update: (proxy, { data: { createTask } }) => {
        const data = proxy.readQuery({ query: QUERY_ALL_TASKS, variables });
        data.allTasks.unshift(createTask);
        proxy.writeQuery({ query: QUERY_ALL_TASKS, variables, data });
      },
    };
  },
};

export default graphql(CREATE_TASK, config)(NewTodoForm);
