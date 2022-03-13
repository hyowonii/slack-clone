import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import useSWR, { mutate } from 'swr';
import { Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, ProfileModal, RightMenu, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from '@layouts/Workspace/styles';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMsg = loadable(() => import('@pages/Channel'));

const Workspace: FC = ({ children }) => {   // FC : children 사용할때

  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data, error } = useSWR('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000  // 2초(캐시 유지 시간)
  }); // swr: 컴포넌트들을 넘나드는 전역 스토리지

  const onLogout = useCallback(() => {
    axios.post('http://localhost:3095/api/users/logout', null, {
      withCredentials: true,  // 쿠키 공유하기
    })
      .then(() => {
        mutate('http://localhost:3095/api/users', false, false);
      });
  }, []);

  const onClickUserProfile = useCallback(() => {  // 토글 함수
    setShowUserMenu((prev) => !prev)
  }, []);

  if (!data) {
    return <Redirect to="/login" />
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(data.email, { s: '28px', d: 'retro' })} alt={data.nickname}></ProfileImg>
            {showUserMenu &&
              <Menu style={{ right: 0, top: 38 }} onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(data.email, { s: '36px', d: 'retro' })} alt={data.nickname}></img>
                  <div>
                    <span id="profile-name">{data.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            }
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>workspace list</Workspaces>
        <Channels>
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>menu scroll</MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/channel" component={Channel} />
            <Route path="/workspace/dm" component={DirectMsg} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      {children}
    </div>
  )
}

export default Workspace;