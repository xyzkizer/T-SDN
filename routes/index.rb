class RootController < SDN

  helpers do
    def login?
      session[:user_id]
    end
    def protected!
      redirect '/login' unless login?
      # halt 401,"You are not authorized to see this page!" unless login?
    end
  end

  before do
    @user = User.get(session[:user_id])
  end

  get '/' do
    protected!
    File.read(File.join('views', 'index.html'))
  end

  get '/topograph' do
    content_type :json
    $redis.get('tapi-net-topology')
  end

  get "/login" do
    # session[:admin]=true; redirect back
    File.read(File.join('views', 'login.html'))
  end

  post "/login" do
    user = User.first(:username => params['username'])

    if user and user.password == params['password']
      session[:user_id] = user.id
      session[:role] = user.role
      logger.debug "login success - #{user.username}"
    end
    [200]
  end

  get "/logout" do
    session[:user_id] = nil
    session[:role] = nil
  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
