class RootController < SDN

  get '/' do
    protected!
    File.read(File.join('views', 'index.html'))
  end

  get '/logout' do
    session["access_token"] = nil
    redirect to("/")
  end

  get '/topograph' do
    content_type :json
    user_topo = $redis.get(%Q(user_#{session['user_id']}.topology))
    tapi = JSON.parse($redis.get('tapi-net-topology'))

    if user_topo and session['user_id'] != "1"
      user_links = JSON.parse(user_topo)['links']
      tapi['links'] = tapi['links'].unshift(*user_links)
    end
    tapi.to_json
  end

  get '/role/:username' do
    logger.debug params
    user = Manager.first(:username => params['username'])
    if user
      [200, %Q({"success":true, "user":#{user.to_json}})]
    end
  end

  get '/login' do
    File.read(File.join('views', 'login.html'))
  end

  post '/login' do
    logger.debug params
    user = Manager.first(:username => params['username'])

    if user and user.password == params['password']
      headers = {
        exp: Time.now.to_i + 600 #expire in 20 seconds
      }
      exp = Time.now.to_i + 600 #expire in 20 seconds
      @token = JWT.encode({user_id: user.username, role: user.role, exp: exp }, nil, 'none', headers)
      session["access_token"] = @token
      session["user_id"] = user.id

      # redirect to("/")


      [200, %Q({"success":true, "token": "#{@token}", "user":#{user.to_json}})]
    else
      [401, %Q({"success":false, "message":"login failed!"})]
    end
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
