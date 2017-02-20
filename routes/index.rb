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
    begin
      @user = Manager.first(:id => session['user_id'])
      if @user and @user.role == 'admin'
        halt [200, $redis.get('hw.topology')]
      elsif @user
        halt [200, $redis.get(%Q(user_#{session['user_id']}.topology))]
      else
        halt [200, %Q({"message":"user not exists or data not correct."})]
      end
    rescue Exception => ex
      logger.error ex
      halt [500, %Q({"message":"Interval error!"})]
    else
    ensure
    end
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
